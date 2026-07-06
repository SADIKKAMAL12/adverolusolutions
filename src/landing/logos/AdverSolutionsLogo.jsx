export function AdverSolutionsLogo({ className = '', size = 36 }) {
  return (
    <svg className={className} width={size} height={size * 0.42} viewBox="0 0 360 152" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* A icon */}
      <path d="M48 144L88 16C90 10 96 8 100 12L140 144H108L96 104H52L40 144H48Z" fill="#E91E63"/>
      <path d="M56 80H92L74 28L56 80Z" fill="#C2185B"/>
      {/* ADVER text */}
      <text x="155" y="108" fontFamily="Arial Black, sans-serif" fontSize="72" fontWeight="900" fill="#E91E63">ADVER</text>
      {/* SOLUTIONS pill */}
      <rect x="330" y="36" width="280" height="80" rx="40" fill="#E91E63"/>
      <text x="470" y="95" fontFamily="Arial Black, sans-serif" fontSize="56" fontWeight="900" fill="white" textAnchor="middle">SOLUTIONS</text>
    </svg>
  );
}

export function AdverSolutionsIcon({ className = '', size = 40 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="24" fill="url(#asGrad)" />
      <path d="M30 82L50 22L70 82H58L50 52L42 82H30Z" fill="white" />
      <path d="M38 62H62L50 28L38 62Z" fill="white" fillOpacity="0.5" />
      <defs>
        <linearGradient id="asGrad" x1="0" y1="0" x2="100" y2="100">
          <stop stopColor="#ff2d55" />
          <stop offset="1" stopColor="#ff4f7a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AdverSolutionsWordmark({ className = '', height = 28 }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ height }}>
      <AdverSolutionsIcon size={height} />
      <span className="font-black tracking-tight text-dark whitespace-nowrap" style={{ fontSize: height * 0.7 }}>
        Adver<span className="text-primary">Solutions</span>
      </span>
    </div>
  );
}
