import express from 'express';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  default as makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3002;

const app = express();
app.use(express.json());

// Session storage
const sessions = new Map();
let activeSessionId = null;

const SESSION_DIR = path.join(__dirname, 'baileys_sessions');

// Ensure session dir exists
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

function getSessionStatus(session) {
  if (!session) return 'logged_out';
  if (session.ready) return 'connected';
  if (session.qr) return 'qr';
  if (session.initializing) return 'initializing';
  return 'error';
}

async function createSession(id) {
  const sessionPath = path.join(SESSION_DIR, id);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: { info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, trace: () => {}, child: () => ({ info: () => {}, error: () => {}, warn: () => {}, debug: () => {}, trace: () => {} }) },
    printQRInTerminal: false,
    auth: state,
    browser: ['AdverSolutions', 'Chrome', '1.0.0'],
  });

  const session = {
    id,
    sock,
    qr: null,
    ready: false,
    initializing: true,
    info: null,
    createdAt: new Date().toISOString(),
  };

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      session.qr = await QRCode.toDataURL(qr);
      session.initializing = false;
      console.log(`[${id}] QR received`);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;

      console.log(`[${id}] Connection closed. Reconnect: ${shouldReconnect}`);
      session.ready = false;
      session.qr = null;

      if (shouldReconnect) {
        // Recreate after short delay
        setTimeout(() => createSession(id), 3000);
      }
    } else if (connection === 'open') {
      session.ready = true;
      session.initializing = false;
      session.qr = null;
      session.info = sock.user;
      console.log(`[${id}] Connected as ${sock.user?.id}`);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sessions.set(id, session);
  return session;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// List devices
app.get('/devices', (_req, res) => {
  const list = Array.from(sessions.values()).map((s) => ({
    id: s.id,
    status: getSessionStatus(s),
    ready: s.ready,
    info: s.info,
    created_at: s.createdAt,
    isActive: s.id === activeSessionId,
  }));
  res.json({ devices: list });
});

// Create device / get QR
app.post('/devices', async (_req, res) => {
  const id = 'wa-' + Date.now();
  const session = await createSession(id);
  if (!activeSessionId) activeSessionId = id;
  res.json({ id, status: 'initializing' });
});

// Remove device
app.delete('/devices/:id', async (req, res) => {
  const { id } = req.params;
  const session = sessions.get(id);
  if (!session) return res.status(404).json({ error: 'Device not found' });

  try {
    await session.sock.logout();
  } catch (e) {
    console.error('Logout error:', e.message);
  }

  sessions.delete(id);
  if (activeSessionId === id) activeSessionId = null;

  // Clean up session dir
  const authDir = path.join(SESSION_DIR, id);
  if (fs.existsSync(authDir)) {
    fs.rmSync(authDir, { recursive: true, force: true });
  }

  res.json({ success: true });
});

// Set active device
app.put('/devices/:id/active', (req, res) => {
  const { id } = req.params;
  if (!sessions.has(id)) return res.status(404).json({ error: 'Device not found' });
  activeSessionId = id;
  res.json({ success: true, active_id: id });
});

// Get QR code
app.get('/qr/:id?', async (req, res) => {
  const id = req.params.id || activeSessionId;
  if (!id) return res.status(400).json({ error: 'No session ID' });

  const session = sessions.get(id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const status = getSessionStatus(session);
  if (status === 'connected') {
    return res.json({ status: 'connected', id });
  }
  if (session.qr) {
    return res.json({ status: 'qr', id, qr: session.qr });
  }
  return res.json({ status, id });
});

// Disconnect
app.post('/disconnect', async (_req, res) => {
  for (const [id, session] of sessions) {
    try {
      await session.sock.logout();
    } catch (e) {}
    const authDir = path.join(SESSION_DIR, id);
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true });
    }
  }
  sessions.clear();
  activeSessionId = null;
  res.json({ success: true });
});

// Send message (used by OTP flow)
app.post('/send', async (req, res) => {
  const { phone, message } = req.body || {};
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message required' });
  }

  const id = activeSessionId;
  if (!id) return res.status(503).json({ error: 'No active WhatsApp session' });

  const session = sessions.get(id);
  if (!session || !session.ready) {
    return res.status(503).json({ error: 'WhatsApp not connected' });
  }

  try {
    const jid = phone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    await session.sock.sendMessage(jid, { text: message });
    res.json({ success: true });
  } catch (err) {
    console.error('Send error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', sessions: sessions.size, active: activeSessionId });
});

app.listen(PORT, () => {
  console.log(`[whatsapp-server] listening on port ${PORT}`);
});
