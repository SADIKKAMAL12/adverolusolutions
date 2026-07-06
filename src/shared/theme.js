const LIGHT = {
  primary: "#E8192C", primaryDark: "#c4111f", primaryLight: "#fef2f3",
  sidebar: "#18080d",
  white: "#ffffff",
  g50: "#f9fafb", g100: "#f3f4f6", g200: "#e5e7eb", g300: "#d1d5db",
  g400: "#9ca3af", g500: "#6b7280", g600: "#4b5563", g700: "#374151",
  g800: "#1f2937", g900: "#111827",
  green: "#10b981", greenL: "#d1fae5",
  yellow: "#f59e0b", yellowL: "#fef3c7",
  blue: "#3b82f6", blueL: "#dbeafe",
  red: "#ef4444", redL: "#fee2e2",
  purple: "#8b5cf6", purpleL: "#ede9fe",
  orange: "#f97316", orangeL: "#ffedd5",
  bg: "#f5f5f8",
  card: "#ffffff",
  topbar: "#ffffff",
  text: "#1f2937",
  textSecondary: "#6b7280",
};

const DARK = {
  primary: "#ff3344", primaryDark: "#e8192c", primaryLight: "rgba(255,51,68,.15)",
  sidebar: "#0f0f1a",
  white: "#ffffff",
  g50: "#1e1e2f", g100: "#252540", g200: "#2d2d44", g300: "#3d3d5c",
  g400: "#8b8ba8", g500: "#a8a8c4", g600: "#c4c4db", g700: "#d8d8ec",
  g800: "#f0f0fa", g900: "#ffffff",
  green: "#34d399", greenL: "rgba(16,185,129,.15)",
  yellow: "#fbbf24", yellowL: "rgba(245,158,11,.15)",
  blue: "#60a5fa", blueL: "rgba(59,130,246,.15)",
  red: "#f87171", redL: "rgba(239,68,68,.15)",
  purple: "#a78bfa", purpleL: "rgba(139,92,246,.15)",
  orange: "#fb923c", orangeL: "rgba(249,115,22,.15)",
  bg: "#0f0f1a",
  card: "#1a1a2e",
  topbar: "#1a1a2e",
  text: "#f0f0fa",
  textSecondary: "#a8a8c4",
};

export const C = LIGHT;

export function getThemeColors(isDark) {
  return isDark ? DARK : LIGHT;
}

export const PLATFORMS = [
  { id: "meta",     name: "Meta (Facebook)",  sub: "Business Manager & Ad Account", icon: "Meta"     },
  { id: "google",   name: "Google Ads",        sub: "Google Ads Account",            icon: "Google"   },
  { id: "tiktok",   name: "TikTok Ads",        sub: "TikTok Business Account",       icon: "TikTok"   },
  { id: "snapchat", name: "Snapchat Ads",      sub: "Snapchat Business Account",     icon: "Snapchat" },
];

export const ADMIN_CREDS = {
  email: "admin@adversolutions.com",
  password: "admin2024",
};

// =====================================================
// Agency Structure Builder — Node & Edge Theme Tokens
// =====================================================

export const BUILDER_NODE_COLORS = {
  profile:           { glow: '#3b82f6', dark: '#0f1a2e', light: '#eff6ff', borderD: '#1e3a5f', borderL: '#bfdbfe', textD: '#dbeafe', textL: '#1e40af' },
  bm_verified:       { glow: '#10b981', dark: '#0a1f15', light: '#ecfdf5', borderD: '#14532d', borderL: '#a7f3d0', textD: '#d1fae5', textL: '#065f46' },
  agency_bm:         { glow: '#8b5cf6', dark: '#1a1033', light: '#f5f3ff', borderD: '#4c1d95', borderL: '#ddd6fe', textD: '#ede9fe', textL: '#5b21b6' },
  advertiser_account:{ glow: '#f59e0b', dark: '#271a05', light: '#fffbeb', borderD: '#78350f', borderL: '#fde68a', textD: '#fef3c7', textL: '#92400e' },
  client_ad_account: { glow: '#06b6d4', dark: '#0a1f24', light: '#ecfeff', borderD: '#155e75', borderL: '#a5f3fc', textD: '#cffafe', textL: '#0e7490' },
  pages_bm:          { glow: '#ec4899', dark: '#2a0a1a', light: '#fdf2f8', borderD: '#831843', borderL: '#fbcfe8', textD: '#fce7f3', textL: '#9d174d' },
  fan_page:          { glow: '#ef4444', dark: '#2a0a0a', light: '#fef2f2', borderD: '#7f1d1d', borderL: '#fecaca', textD: '#fee2e2', textL: '#991b1b' },
  pixel:             { glow: '#14b8a6', dark: '#0a1f1c', light: '#f0fdfa', borderD: '#134e4a', borderL: '#99f6e4', textD: '#ccfbf1', textL: '#115e59' },
  dataset:           { glow: '#6366f1', dark: '#0f0a2e', light: '#eef2ff', borderD: '#312e81', borderL: '#c7d2fe', textD: '#e0e7ff', textL: '#3730a3' },
  domain:            { glow: '#f97316', dark: '#271306', light: '#fff7ed', borderD: '#7c2d12', borderL: '#fed7aa', textD: '#ffedd5', textL: '#9a3412' },
  backup_admin:      { glow: '#84cc16', dark: '#1a2405', light: '#f7fee7', borderD: '#3f6212', borderL: '#d9f99d', textD: '#ecfccb', textL: '#4d7c0f' },
  employee:          { glow: '#64748b', dark: '#0f172a', light: '#f8fafc', borderD: '#334155', borderL: '#cbd5e1', textD: '#e2e8f0', textL: '#475569' },
  media_buyer:       { glow: '#d946ef', dark: '#2a0a2a', light: '#fdf4ff', borderD: '#86198f', borderL: '#f0abfc', textD: '#fae8ff', textL: '#a21caf' },
};

export const BUILDER_EDGE_COLORS = {
  admin:             '#ef4444',
  partner:           '#3b82f6',
  advertiser_access: '#f59e0b',
  employee:          '#10b981',
  pixel_sharing:     '#8b5cf6',
  domain_sharing:    '#06b6d4',
};

export const BUILDER_EDGE_STYLES = {
  admin:             { strokeDasharray: undefined, animated: false },
  partner:           { strokeDasharray: undefined, animated: false },
  advertiser_access: { strokeDasharray: '5,5',     animated: true  },
  employee:          { strokeDasharray: '2,4',     animated: false },
  pixel_sharing:     { strokeDasharray: '8,4,2,4', animated: true  },
  domain_sharing:    { strokeDasharray: '4,4',     animated: false },
};

export function getNodeTheme(nodeType, isDark) {
  const c = BUILDER_NODE_COLORS[nodeType] || BUILDER_NODE_COLORS.profile;
  return {
    glow: c.glow,
    bg: isDark ? c.dark : c.light,
    border: isDark ? c.borderD : c.borderL,
    text: isDark ? c.textD : c.textL,
  };
}

export function getEdgeTheme(connectionType) {
  return {
    color: BUILDER_EDGE_COLORS[connectionType] || '#6b7280',
    ...BUILDER_EDGE_STYLES[connectionType],
  };
}
