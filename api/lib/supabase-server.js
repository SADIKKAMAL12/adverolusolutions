import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'

let _client = null

export function getSupabase() {
  if (_client) return _client

  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '')
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  if (!url || !key) return null

  _client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket },
  })

  return _client
}
