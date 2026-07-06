// Helper to safely access array props with defaults
export function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

export function safeObj(obj) {
  return obj && typeof obj === 'object' ? obj : {};
}
