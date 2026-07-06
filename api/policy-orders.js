import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { sendOrderNotification } from './admin/order-notifications.js'

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1FdlN8bMvldkuDnSX9iVCpRWAs1K4xfAQTMlh402L8e4'
const SA_KEY_FILE = process.env.GOOGLE_SA_KEY_FILE || '/etc/adversolutions/google-sa.json'

function getSheets() {
  const keyFile = SA_KEY_FILE
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

function padTicket(n) {
  return `ADS-${String(n).padStart(6, '0')}`
}

function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    ''
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, account_type, payment_method, amount, policy_type, language } = req.body || {}

  if (!name || !email || !account_type || !payment_method || !amount) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const sheets = getSheets()

    // Get current row count to generate sequential ticket ID
    const metaRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:A',
    })
    const rows = metaRes.data.values || []
    // rows[0] is header, so ticket number = rows.length (count includes header)
    const ticketNumber = rows.length  // rows.length - 1 data rows + 1 for the new row
    const ticketId = padTicket(ticketNumber)

    const now = new Date()
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19)
    const ip = getClientIP(req)

    const row = [
      ticketId,
      dateStr,
      name,
      email,
      account_type,
      payment_method,
      amount,
      'Pending Payment',
      '',            // Notes
      ip,
      policy_type || '',
      language || 'en',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })

    sendOrderNotification('order', {
      ticket_id: ticketId, name, email, account_type, payment_method, amount,
      policy_type: policy_type || '', language: language || 'en',
    })

    return res.status(201).json({ ticket_id: ticketId })
  } catch (err) {
    console.error('[policy-orders] Error:', err)
    return res.status(500).json({ error: 'Failed to save order. Please try again.' })
  }
}
