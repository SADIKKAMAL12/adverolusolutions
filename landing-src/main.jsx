import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LandingPage from './LandingPage.jsx'
import AuthPageWA from './AuthPageWA.jsx'

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = { raw: text } }
  }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`)
  return data
}

const path = window.location.pathname

function App() {
  if (path === '/login') {
    return (
      <AuthPageWA
        initialMode="signin"
        onSignIn={async ({ email, password }) => {
          await postJSON('/api/auth/login', { email, password })
          window.location.href = '/'
        }}
        onSignUp={async (payload) => {
          await postJSON('/api/auth/register', payload)
          window.location.href = '/'
        }}
      />
    )
  }
  if (path === '/register') {
    return (
      <AuthPageWA
        initialMode="signup"
        onSignIn={async ({ email, password }) => {
          await postJSON('/api/auth/login', { email, password })
          window.location.href = '/'
        }}
        onSignUp={async (payload) => {
          await postJSON('/api/auth/register', payload)
          window.location.href = '/'
        }}
      />
    )
  }
  return (
    <LandingPage
      onNavigateLogin={() => { window.location.href = '/login' }}
      onNavigateSignup={() => { window.location.href = '/register' }}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
