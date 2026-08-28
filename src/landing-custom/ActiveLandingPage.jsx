import { useState, useEffect } from 'react'
import { getTemplateByKey } from './templates/registry.js'

// Renders whichever landing page template the admin has set active (via the
// Appearance settings page). Defaults to the 'default' template immediately
// so there's no blank flash while the fetch resolves, then swaps in the real
// active template once known.
export default function ActiveLandingPage(props) {
  const [templateKey, setTemplateKey] = useState('default')

  useEffect(() => {
    let cancelled = false
    fetch('/api/appearance-settings')
      .then(r => r.json())
      .then(data => { if (!cancelled && data?.active_template) setTemplateKey(data.active_template) })
      .catch(() => { /* keep default on failure */ })
    return () => { cancelled = true }
  }, [])

  const Template = getTemplateByKey(templateKey).component
  return <Template {...props} />
}
