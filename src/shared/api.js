// Fetch helper for the new user dashboard pages.
// Sends cookies (httpOnly session), parses JSON, throws on errors, bounces to login on 401.

export async function apiFetch(url, options = {}) {
  let res
  try {
    res = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch {
    throw new Error('Network error — check your connection.')
  }

  if (res.status === 401) {
    if (window.location.hash !== '#/login' && window.location.hash !== '/login') {
      window.location.hash = '/login'
    }
    throw new Error('Session expired')
  }

  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = { raw: text } }
  }

  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`)
  return data
}

export const api = {
  get:  (url)        => apiFetch(url),
  post: (url, body)  => apiFetch(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:  (url, body)  => apiFetch(url, { method: 'PUT',    body: JSON.stringify(body) }),
  del:  (url)        => apiFetch(url, { method: 'DELETE' }),
}
