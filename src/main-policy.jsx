import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './shared/ThemeContext.jsx'
import PolicyPortalPage from './policies/PolicyPortalPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <PolicyPortalPage />
    </ThemeProvider>
  </StrictMode>
)
