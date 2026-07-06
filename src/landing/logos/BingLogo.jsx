export function BingIcon({ className = '', size = 40 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#008373" />
      <path d="M28 18L72 38L48 50L72 62L28 82V18Z" fill="white" />
      <path d="M28 18L48 50L28 82V18Z" fill="#D9D9D9" fillOpacity="0.3" />
    </svg>
  );
}

export function BingLogoFull({ className = '', height = 32 }) {
  return (
    <svg className={className} height={height} viewBox="0 0 320 60" fill="none">
      <path d="M8 18L52 38L28 50L52 62L8 82V18Z" fill="#008373" />
      <path d="M8 18L28 50L8 82V18Z" fill="#00A4A0" />
      <text x="68" y="48" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="600" fill="#008373">Bing Ads</text>
    </svg>
  );
}
