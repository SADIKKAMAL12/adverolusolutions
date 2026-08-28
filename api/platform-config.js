// /api/platform-config — combined platform pricing + fields configuration.
// Pricing: persisted to Supabase `platform_prices` table.
// Fields:  persisted to data/platform_fields.json on disk (no schema change needed).

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIELDS_FILE = path.join(__dirname, '..', 'data', 'platform_fields.json')

const DEFAULT_FIELDS = {
  meta: [
    { key: 'bm_id',      label: 'Business Manager ID',                  type: 'text',     required: false, placeholder: '123456789012345' },
    { key: 'page_links', label: 'Facebook Page Links (one per line)',    type: 'textarea', required: false, placeholder: 'https://facebook.com/your-brand' },
    { key: 'domain',     label: 'Domain Name',                          type: 'text',     required: false, placeholder: 'yourbrand.com' },
  ],
  google: [
    { key: 'gmail', label: 'Gmail Account (fresh)', type: 'email', required: false, placeholder: 'yourbrand@gmail.com' },
  ],
  tiktok: [
    { key: 'business_center_id', label: 'TikTok Business Center ID', type: 'text', required: false, placeholder: '7000000000000' },
  ],
  snapchat: [
    { key: 'snap_profile', label: 'Snapchat Business Profile URL', type: 'url', required: false, placeholder: 'https://www.snapchat.com/add/your-brand' },
  ],
}

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function readFields() {
  try {
    return JSON.parse(fs.readFileSync(FIELDS_FILE, 'utf8'))
  } catch {
    return DEFAULT_FIELDS
  }
}

function writeFields(fields) {
  fs.mkdirSync(path.dirname(FIELDS_FILE), { recursive: true })
  fs.writeFileSync(FIELDS_FILE, JSON.stringify(fields, null, 2))
}

export default async function handler(req, res) {
  const sb = getSupabase()

  // ── GET: return pricing from Supabase + fields from disk ─────────────────────
  if (req.method === 'GET') {
    const fields = readFields()
    let pricing = {}
    if (sb) {
      const { data } = await sb.from('platform_prices').select('*')
      if (data) {
        data.forEach(p => {
          pricing[p.id] = { price: p.price, fee: p.fee, minTopup: p.min_topup, active: p.active, name: p.name }
        })
      }
    }
    // Merge: return array of platforms with both pricing and fields
    // `name` is required by the frontend (e.g. AgencyAdAccounts.jsx reads
    // p.name[0] for a fallback logo letter) — this response never included
    // it before, crashing the "Create Ad Account" wizard for every platform.
    const DEFAULT_NAMES = { meta: 'Meta (Facebook)', google: 'Google Ads', tiktok: 'TikTok Ads', snapchat: 'Snapchat Ads' }
    const platforms = ['meta', 'google', 'tiktok', 'snapchat']
    const result = platforms.map(id => ({
      id,
      name:     pricing[id]?.name     ?? DEFAULT_NAMES[id] ?? (id.charAt(0).toUpperCase() + id.slice(1)),
      price:    pricing[id]?.price    ?? 50,
      fee:      pricing[id]?.fee      ?? 6,
      minTopup: pricing[id]?.minTopup ?? 200,
      active:   pricing[id]?.active   ?? true,
      fields:   fields[id]            ?? DEFAULT_FIELDS[id] ?? [],
    }))
    return res.status(200).json(result)
  }

  // ── POST: save pricing to Supabase + fields to disk ──────────────────────────
  if (req.method === 'POST') {
    const body = req.body || {}
    const { pricing, fields } = body

    // Save fields to disk
    if (fields && typeof fields === 'object') {
      writeFields(fields)
    }

    // Save pricing to Supabase
    if (pricing && sb) {
      const upserts = Object.entries(pricing).map(([id, p]) => ({
        id,
        price:     Number(p.price    ?? 50),
        fee:       Number(p.fee      ?? 6),
        min_topup: Number(p.minTopup ?? 200),
        active:    p.active ?? true,
      }))
      const { error } = await sb.from('platform_prices').upsert(upserts)
      if (error) {
        console.error('platform_prices upsert error:', error.message)
        return res.status(500).json({ error: error.message })
      }
    }

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
