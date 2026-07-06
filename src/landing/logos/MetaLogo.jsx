export function MetaIcon({ className = '', size = 40 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#1877F2" />
      <path d="M50 18C35 18 24 30 24 50C24 70 35 82 50 82C65 82 76 70 76 50C76 30 65 18 50 18Z" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
      <path d="M28 50C28 35 36 24 50 24C58 24 64 30 64 38C64 46 58 50 50 50C42 50 36 54 36 62C36 70 42 76 50 76C64 76 72 65 72 50" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function MetaLogoFull({ className = '', height = 32 }) {
  return (
    <svg className={className} height={height} viewBox="0 0 300 60" fill="none">
      <path d="M8 50C8 25 20 10 40 10C52 10 60 18 60 30C60 42 52 50 40 50C28 50 20 42 20 30C20 18 28 10 40 10" fill="none" stroke="#1877F2" strokeWidth="8" strokeLinecap="round" />
      <text x="75" y="45" fontFamily="Arial, sans-serif" fontSize="42" fontWeight="700" fill="#1c1e21">Meta</text>
    </svg>
  );
}
