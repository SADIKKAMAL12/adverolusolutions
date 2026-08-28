// Exact palette/tokens from the Claude Design "AdminDashboardPage.jsx" mockup —
// kept as its own theme (separate from shared/theme.js's C/getThemeColors) so
// every admin page built from that mockup looks pixel-identical to the design,
// rather than being re-derived through the app's customer-facing token system.
export const BRAND = "#ff2d55"
export const BRAND_LIGHT = "#ff5470"
export const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'

const THEMES = {
  light: {
    mode: "light",
    pageBg: "#f6f6f8",
    surface: "#ffffff",
    surfaceAlt: "#fafafb",
    surfaceSunken: "#f2f2f4",
    border: "rgba(10,10,20,0.07)",
    borderStrong: "rgba(10,10,20,0.12)",
    text: "#0f0f12",
    textMuted: "#6b6b72",
    textFaint: "#9a9aa2",
    shadow: "0 20px 50px -30px rgba(10,10,30,0.18)",
    shadowLg: "0 40px 90px -40px rgba(10,10,30,0.25)",
    glowSoft: "0 0 0 1px rgba(255,45,85,0.08), 0 12px 30px -16px rgba(255,45,85,0.25)",
  },
  dark: {
    mode: "dark",
    pageBg: "#08080b",
    surface: "#131317",
    surfaceAlt: "#0e0e11",
    surfaceSunken: "#1a1a1f",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",
    text: "#f5f5f8",
    textMuted: "#9d9da6",
    textFaint: "#6d6d78",
    shadow: "0 20px 50px -25px rgba(0,0,0,0.6)",
    shadowLg: "0 40px 100px -30px rgba(0,0,0,0.7)",
    glowSoft: "0 0 0 1px rgba(255,45,85,0.18), 0 0 40px -8px rgba(255,45,85,0.35)",
  },
}

export function getAdminTheme(isDark) {
  return isDark ? THEMES.dark : THEMES.light
}

export function GlassCard({ theme, children, style, glow, ...rest }) {
  return (
    <div
      style={{
        background: theme.mode === "dark" ? "rgba(255,255,255,0.035)" : theme.surface,
        backdropFilter: theme.mode === "dark" ? "blur(20px)" : "none",
        WebkitBackdropFilter: theme.mode === "dark" ? "blur(20px)" : "none",
        border: `1px solid ${glow ? "rgba(255,45,85,0.25)" : theme.border}`,
        borderRadius: 20,
        boxShadow: glow ? theme.glowSoft : theme.shadow,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
