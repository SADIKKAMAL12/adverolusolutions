// Registry of available landing page templates. Each entry's `key` is what's
// stored in appearance-settings.json as `active_template` — add a new entry
// here (plus its component file) whenever a new template is dropped in, and
// it will show up automatically on the admin Appearance page and become
// selectable, without touching any other code.
import LandingPage from '../LandingPage.jsx'
import AdverSolutionsPremium from '../AdverSolutionsPremium.jsx'
import AdverSolutionsAurora from '../AdverSolutionsAurora.jsx'
import AdverSolutionsMinimal from '../AdverSolutionsMinimal.jsx'
import AdverSolutionsMaintenance from '../AdverSolutionsMaintenance.jsx'

export const LANDING_TEMPLATES = [
  {
    key: 'default',
    label: 'Default',
    description: 'The current AdverSolutions landing page — platforms, features, pricing, savings calculator, FAQ.',
    component: LandingPage,
  },
  {
    key: 'premium',
    label: 'Premium',
    description: 'An Apple-inspired restyle of the default page — same sections, copy, and pricing, refined typography and spacing.',
    component: AdverSolutionsPremium,
  },
  {
    key: 'aurora',
    label: 'Aurora',
    description: 'A magenta-aurora refresh with glass pricing cards and scroll-reveal motion.',
    component: AdverSolutionsAurora,
  },
  {
    key: 'minimal',
    label: 'Minimal',
    description: 'A dark-by-default, Manrope-set page with scroll-reveal sections and a light/dark toggle in the nav.',
    component: AdverSolutionsMinimal,
  },
  {
    key: 'maintenance',
    label: 'Coming Soon',
    description: 'A quiet "under maintenance" holding page — no nav, no signup, just a status message. Use this to take the site offline for visitors without touching the app itself.',
    component: AdverSolutionsMaintenance,
  },
]

export function getTemplateByKey(key) {
  return LANDING_TEMPLATES.find(t => t.key === key) || LANDING_TEMPLATES[0]
}
