export function TikTokIcon({ className = '', size = 40 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="22" fill="#000" />
      <path d="M42 28C42 28 58 28 58 48V72H48V52C48 42 42 38 42 38V28Z" fill="#00f2ea" />
      <path d="M46 30C46 30 62 30 62 50V74H52V54C52 44 46 40 46 40V30Z" fill="#ff0050" />
      <path d="M44 29C44 29 60 29 60 49V73H50V53C50 43 44 39 44 39V29Z" fill="white" />
      <circle cx="38" cy="64" r="8" fill="white" />
      <circle cx="40" cy="62" r="8" fill="#ff0050" />
      <circle cx="36" cy="66" r="8" fill="#00f2ea" />
    </svg>
  );
}
