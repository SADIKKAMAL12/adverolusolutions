export function GoogleAdsIcon({ className = '', size = 40 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="white" />
      {/* Blue capsule */}
      <rect x="48" y="8" width="28" height="72" rx="14" fill="#4285F4" transform="rotate(25 62 44)" />
      {/* Yellow triangle */}
      <path d="M20 78L62 8L42 8L20 78Z" fill="#FBBC04" />
      {/* Green circle */}
      <circle cx="28" cy="72" r="18" fill="#34A853" />
    </svg>
  );
}
