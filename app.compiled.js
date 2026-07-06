function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* ===== theme.js ===== */
const C = {
  primary: "#E8192C",
  primaryDark: "#c4111f",
  primaryLight: "#fef2f3",
  sidebar: "#18080d",
  white: "#ffffff",
  g50: "#f9fafb",
  g100: "#f3f4f6",
  g200: "#e5e7eb",
  g300: "#d1d5db",
  g400: "#9ca3af",
  g500: "#6b7280",
  g600: "#4b5563",
  g700: "#374151",
  g800: "#1f2937",
  g900: "#111827",
  green: "#10b981",
  greenL: "#d1fae5",
  yellow: "#f59e0b",
  yellowL: "#fef3c7",
  blue: "#3b82f6",
  blueL: "#dbeafe",
  red: "#ef4444",
  redL: "#fee2e2",
  purple: "#8b5cf6",
  purpleL: "#ede9fe",
  orange: "#f97316",
  orangeL: "#ffedd5"
};
const PLATFORMS = [{
  id: "meta",
  name: "Meta (Facebook)",
  sub: "Business Manager & Ad Account",
  icon: "Meta"
}, {
  id: "google",
  name: "Google Ads",
  sub: "Google Ads Account",
  icon: "Google"
}, {
  id: "tiktok",
  name: "TikTok Ads",
  sub: "TikTok Business Account",
  icon: "TikTok"
}, {
  id: "snapchat",
  name: "Snapchat Ads",
  sub: "Snapchat Business Account",
  icon: "Snapchat"
}];
const ADMIN_CREDS = {
  email: "admin@adversolutions.com",
  password: "admin2024"
};

/* ===== mockData.js ===== */
const MOCK_TRANSACTIONS = [{
  id: 1,
  type: "Deposit",
  method: "Payoneer",
  amount: 350,
  status: "pending",
  date: "May 19, 2024 10:30 AM"
}, {
  id: 2,
  type: "Deposit",
  method: "USDT (TRC20)",
  amount: 200,
  status: "completed",
  date: "May 17, 2024 08:15 PM"
}, {
  id: 3,
  type: "Top Up Bonus",
  method: "System",
  amount: 20,
  status: "completed",
  date: "May 17, 2024 08:16 PM"
}, {
  id: 4,
  type: "Spent",
  method: "Ad Account",
  amount: -120,
  status: "completed",
  date: "May 16, 2024 03:45 PM"
}, {
  id: 5,
  type: "Deposit",
  method: "Bank Transfer",
  amount: 500,
  status: "completed",
  date: "May 15, 2024 11:20 AM"
}, {
  id: 6,
  type: "Spent",
  method: "Pre-Verified",
  amount: -95,
  status: "completed",
  date: "May 14, 2024 02:10 PM"
}, {
  id: 7,
  type: "Deposit",
  method: "Wise",
  amount: 300,
  status: "completed",
  date: "May 12, 2024 09:00 AM"
}, {
  id: 8,
  type: "Refund",
  method: "System",
  amount: 50,
  status: "completed",
  date: "May 11, 2024 04:30 PM"
}];
const MOCK_AD_ACCOUNTS = [{
  name: "Meta Ads Account 01",
  id: "META-468102",
  platform: "Meta",
  type: "Agency Account",
  user: "john.doe@example.com",
  balance: 250,
  status: "active",
  date: "May 25, 2024"
}, {
  name: "Google Ads Account 02",
  id: "GGL-784512",
  platform: "Google",
  type: "Client Account",
  user: "william@exemple.com",
  balance: 150,
  status: "active",
  date: "May 25, 2024"
}, {
  name: "TikTok Ads Account 03",
  id: "TTK-951753",
  platform: "TikTok",
  type: "Agency Account",
  user: "emma@exemple.com",
  balance: 100,
  status: "pending",
  date: "May 25, 2024"
}, {
  name: "Snapchat Ads Account 04",
  id: "SCP-357159",
  platform: "Snapchat",
  type: "Client Account",
  user: "olivia@exemple.com",
  balance: 80,
  status: "active",
  date: "May 24, 2024"
}, {
  name: "Meta Ads Account 05",
  id: "META-357951",
  platform: "Meta",
  type: "Agency Account",
  user: "james@exemple.com",
  balance: 200,
  status: "disabled",
  date: "May 23, 2024"
}];
const MOCK_INVENTORY = Array.from({
  length: 10
}, (_, i) => ({
  id: `PVA-${String(i + 1).padStart(4, "0")}`,
  email: ["john.doe***@gmail.com", "alex.smi***@gmail.com", "mark.joh***@gmail.com", "sarah.wil***@gmail.com", "james.bro***@gmail.com"][i % 5],
  status: ["available", "reserved", "sold", "available", "available", "sold", "disabled", "available", "reserved", "available"][i],
  date: "May 29, 2024"
}));
const MOCK_MEDIA_BUYERS = [{
  id: 1,
  name: "Alex Morgan",
  avatar: "AM",
  email: "alex@mediapro.com",
  speciality: "Meta Ads Expert",
  platforms: ["Meta", "Google"],
  experience: "5 years",
  spent: "$2.4M+",
  rate: 350,
  rating: 4.9,
  reviews: 128,
  orders: 156,
  status: "approved",
  joined: "May 1, 2024",
  portfolio: "https://alexmorgan.media"
}, {
  id: 2,
  name: "Sarah Johnson",
  avatar: "SJ",
  email: "sarah@adspro.com",
  speciality: "Google Ads Specialist",
  platforms: ["Google"],
  experience: "4 years",
  spent: "$1.8M+",
  rate: 320,
  rating: 4.8,
  reviews: 96,
  orders: 112,
  status: "approved",
  joined: "Apr 15, 2024",
  portfolio: "https://sarahjohnson.ads"
}, {
  id: 3,
  name: "David Lee",
  avatar: "DL",
  email: "david@tiktokads.io",
  speciality: "TikTok Ads Expert",
  platforms: ["TikTok"],
  experience: "3 years",
  spent: "$1.2M+",
  rate: 300,
  rating: 4.7,
  reviews: 0,
  orders: 0,
  status: "pending",
  joined: "May 20, 2024",
  portfolio: "https://davidlee.io"
}, {
  id: 4,
  name: "Emily Carter",
  avatar: "EC",
  email: "emily@fullads.com",
  speciality: "Snapchat Ads Expert",
  platforms: ["Snapchat", "Meta"],
  experience: "6 years",
  spent: "$950K+",
  rate: 280,
  rating: 4.9,
  reviews: 0,
  orders: 0,
  status: "pending",
  joined: "May 22, 2024",
  portfolio: "https://emilycarter.ads"
}, {
  id: 5,
  name: "Michael Brown",
  avatar: "MB",
  email: "mike@adscale.com",
  speciality: "Meta & TikTok Expert",
  platforms: ["Meta", "TikTok"],
  experience: "4 years",
  spent: "$1.6M+",
  rate: 400,
  rating: 4.6,
  reviews: 58,
  orders: 84,
  status: "approved",
  joined: "Mar 10, 2024",
  portfolio: "https://mikebrown.media"
}, {
  id: 6,
  name: "James Wilson",
  avatar: "JW",
  email: "james@googleads.pro",
  speciality: "Google & YouTube Ads",
  platforms: ["Google"],
  experience: "2 years",
  spent: "$780K+",
  rate: 250,
  rating: 0,
  reviews: 0,
  orders: 0,
  status: "rejected",
  joined: "May 18, 2024",
  portfolio: "https://jameswilson.pro",
  rejectReason: "Insufficient portfolio documentation"
}, {
  id: 7,
  name: "Daniel Sanchez",
  avatar: "DS",
  email: "daniel@tikpro.io",
  speciality: "TikTok & Meta Expert",
  platforms: ["TikTok", "Meta"],
  experience: "3 years",
  spent: "$1.1M+",
  rate: 330,
  rating: 0,
  reviews: 0,
  orders: 0,
  status: "pending",
  joined: "May 25, 2024",
  portfolio: "https://danielsanchez.io"
}, {
  id: 8,
  name: "Sophia Martinez",
  avatar: "SM",
  email: "sophia@fullfunnel.co",
  speciality: "Full Funnel Specialist",
  platforms: ["Meta", "Google", "TikTok"],
  experience: "7 years",
  spent: "$2.2M+",
  rate: 450,
  rating: 4.8,
  reviews: 91,
  orders: 131,
  status: "approved",
  joined: "Feb 5, 2024",
  portfolio: "https://sophiamartinez.co"
}];
const MOCK_ORDERS = [{
  id: "ORD-98765",
  user: "john.doe@example.com",
  type: "Ad Account",
  platform: "Meta",
  amount: 120,
  status: "completed",
  date: "May 25, 2024"
}, {
  id: "ORD-98764",
  user: "william@example.com",
  type: "Pre-Verified Account",
  platform: "Google",
  amount: 150,
  status: "completed",
  date: "May 25, 2024"
}, {
  id: "ORD-98763",
  user: "emma@example.com",
  type: "Ad Account",
  platform: "TikTok",
  amount: 100,
  status: "processing",
  date: "May 25, 2024"
}, {
  id: "ORD-98762",
  user: "olivia@example.com",
  type: "Ad Account",
  platform: "Snapchat",
  amount: 90,
  status: "pending",
  date: "May 25, 2024"
}, {
  id: "ORD-98761",
  user: "james@example.com",
  type: "Pre-Verified Account",
  platform: "Meta",
  amount: 110,
  status: "completed",
  date: "May 25, 2024"
}];
const MOCK_USERS = [{
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  balance: 1240,
  accounts: 12,
  status: "active",
  joined: "Jan 5, 2024"
}, {
  id: 2,
  name: "William Smith",
  email: "william@example.com",
  balance: 850,
  accounts: 8,
  status: "active",
  joined: "Jan 18, 2024"
}, {
  id: 3,
  name: "Emma Johnson",
  email: "emma@example.com",
  balance: 320,
  accounts: 3,
  status: "active",
  joined: "Feb 2, 2024"
}, {
  id: 4,
  name: "Olivia Brown",
  email: "olivia@example.com",
  balance: 2100,
  accounts: 21,
  status: "active",
  joined: "Feb 14, 2024"
}, {
  id: 5,
  name: "James Wilson",
  email: "james@example.com",
  balance: 0,
  accounts: 0,
  status: "banned",
  joined: "Mar 1, 2024"
}, {
  id: 6,
  name: "Sophia Garcia",
  email: "sophia@example.com",
  balance: 670,
  accounts: 5,
  status: "active",
  joined: "Mar 20, 2024"
}, {
  id: 7,
  name: "Daniel Martinez",
  email: "daniel@example.com",
  balance: 0,
  accounts: 0,
  status: "pending",
  joined: "Apr 3, 2024"
}, {
  id: 8,
  name: "Mia Anderson",
  email: "mia@example.com",
  balance: 1580,
  accounts: 14,
  status: "active",
  joined: "Apr 15, 2024"
}];
const MOCK_DEPOSITS = [{
  id: "DEP-001",
  user: "john.doe@example.com",
  method: "Payoneer",
  amount: 350,
  status: "pending",
  date: "May 19, 2024 10:30 AM",
  proof: "proof_001.png"
}, {
  id: "DEP-002",
  user: "william@example.com",
  method: "Bank Transfer",
  amount: 500,
  status: "completed",
  date: "May 18, 2024 09:00 AM",
  proof: "proof_002.pdf"
}, {
  id: "DEP-003",
  user: "emma@example.com",
  method: "USDT (TRC20)",
  amount: 200,
  status: "pending",
  date: "May 17, 2024 02:30 PM",
  proof: "proof_003.png"
}, {
  id: "DEP-004",
  user: "olivia@example.com",
  method: "Wise",
  amount: 1000,
  status: "completed",
  date: "May 16, 2024 11:00 AM",
  proof: "proof_004.jpg"
}, {
  id: "DEP-005",
  user: "sophia@example.com",
  method: "Binance",
  amount: 150,
  status: "pending",
  date: "May 15, 2024 04:15 PM",
  proof: "proof_005.png"
}];

/* ===== UI.jsx ===== */

/* ══════════════════════════════════════════════════
   LOGO  — uses the actual brand mark from the upload
══════════════════════════════════════════════════ */
const Logo = ({
  size = "sm"
}) => {
  const lg = size === "lg";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: lg ? 14 : 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 54 54",
    width: lg ? 54 : 36,
    height: lg ? 54 : 36
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "ag1",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#ff5577"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#E8192C"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: "ag2",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "100%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#3d1a2e"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1a0a0e"
  }))), /*#__PURE__*/React.createElement("polygon", {
    points: "6,48 22,10 30,28 18,48",
    fill: "url(#ag1)"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "48,48 32,10 24,28 36,48",
    fill: "url(#ag1)"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "21,48 27,34 33,48",
    fill: "url(#ag2)",
    opacity: "0.75"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "17",
    y: "31",
    width: "20",
    height: "4",
    rx: "2",
    fill: "url(#ag1)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      lineHeight: 1,
      display: "flex",
      alignItems: "center",
      gap: lg ? 5 : 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Sora',sans-serif",
      fontWeight: 900,
      fontSize: lg ? 22 : 15,
      color: "#fff",
      letterSpacing: lg ? 1 : .5
    }
  }, "ADVER"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "'Sora',sans-serif",
      fontWeight: 900,
      fontSize: lg ? 22 : 15,
      color: "#fff",
      background: C.primary,
      padding: lg ? "4px 12px" : "2px 8px",
      borderRadius: 30,
      letterSpacing: lg ? 1 : .5
    }
  }, "SOLUTIONS")));
};

/* ══════════════════════════════════════════════════
   PLATFORM ICONS
══════════════════════════════════════════════════ */
const PlatformIcon = ({
  name,
  size = 16
}) => {
  const s = size;
  const icons = {
    Meta: /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "#1877f2"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    })),
    Google: /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24"
    }, /*#__PURE__*/React.createElement("path", {
      fill: "#4285F4",
      d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    }), /*#__PURE__*/React.createElement("path", {
      fill: "#34A853",
      d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    }), /*#__PURE__*/React.createElement("path", {
      fill: "#FBBC05",
      d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    }), /*#__PURE__*/React.createElement("path", {
      fill: "#EA4335",
      d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    })),
    TikTok: /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "#010101"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.23 8.23 0 004.81 1.54V6.78a4.85 4.85 0 01-1.04-.09z"
    })),
    Snapchat: /*#__PURE__*/React.createElement("svg", {
      width: s,
      height: s,
      viewBox: "0 0 24 24",
      fill: "#FFFC00",
      stroke: "#aaa",
      strokeWidth: "0.3"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M12.166.006C8.323.176 5.309 2.73 4.926 6.1c-.105.924.015 1.95.352 3.13a1.94 1.94 0 01-.647.106c-.45 0-.91-.117-1.32-.37a.578.578 0 00-.3-.084.535.535 0 00-.544.523c0 .282.195.514.46.558.854.139 1.535.55 2.03 1.243.6.84.685 1.681.685 1.724 0 .258-.196.483-.472.556C4.32 13.6 3.364 13.85 2.5 14.5c-.356.267-.5.658-.5 1.058 0 .62.306 1.23.864 1.605.21.14.445.21.683.21.22 0 .44-.055.637-.163.335-.183.639-.273.923-.273.224 0 .438.045.64.137.578.264 1.036.777 1.374 1.53.257.573.594 1.38 1.44 1.38.282 0 .603-.085.984-.27a5.3 5.3 0 012.456-.6c.84 0 1.67.2 2.456.6.38.185.702.27.984.27.846 0 1.183-.807 1.44-1.38.338-.753.796-1.266 1.374-1.53.202-.092.416-.137.64-.137.284 0 .588.09.923.273.197.108.417.163.637.163.238 0 .473-.07.683-.21.558-.375.864-.985.864-1.605 0-.4-.144-.79-.5-1.058-.864-.65-1.82-.9-2.67-1.094-.276-.073-.472-.298-.472-.556 0-.043.085-.884.685-1.724.495-.693 1.176-1.104 2.03-1.243.265-.044.46-.276.46-.558a.535.535 0 00-.544-.523.578.578 0 00-.3.084c-.41.253-.87.37-1.32.37-.22 0-.441-.035-.647-.106.337-1.18.457-2.206.352-3.13C18.691 2.73 15.677.176 12.166.006z"
    }))
  };
  return icons[name] || /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: s,
      lineHeight: 1
    }
  }, "\u25CF");
};

/* ══════════════════════════════════════════════════
   BADGE
══════════════════════════════════════════════════ */
const Badge = ({
  status
}) => {
  const map = {
    available: {
      bg: C.greenL,
      c: C.green
    },
    active: {
      bg: C.greenL,
      c: C.green
    },
    completed: {
      bg: C.greenL,
      c: C.green
    },
    approved: {
      bg: C.greenL,
      c: C.green
    },
    reserved: {
      bg: C.yellowL,
      c: "#d97706"
    },
    pending: {
      bg: C.yellowL,
      c: "#d97706"
    },
    "pending review": {
      bg: C.yellowL,
      c: "#d97706"
    },
    processing: {
      bg: C.blueL,
      c: C.blue
    },
    sold: {
      bg: C.blueL,
      c: C.blue
    },
    disabled: {
      bg: C.redL,
      c: C.red
    },
    rejected: {
      bg: C.redL,
      c: C.red
    },
    banned: {
      bg: C.redL,
      c: C.red
    }
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: s.bg,
      color: s.c,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 12,
      fontWeight: 700,
      textTransform: "capitalize",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: s.c,
      flexShrink: 0
    }
  }), status);
};

/* ══════════════════════════════════════════════════
   BUTTON
══════════════════════════════════════════════════ */
const Btn = ({
  children,
  variant = "primary",
  size = "md",
  full,
  style: st,
  ...props
}) => {
  const sz = {
    sm: {
      padding: "7px 14px",
      fontSize: 12
    },
    md: {
      padding: "10px 22px",
      fontSize: 13
    },
    lg: {
      padding: "13px 28px",
      fontSize: 15
    }
  }[size];
  const v = {
    primary: {
      background: C.primary,
      color: "#fff",
      border: "none"
    },
    outline: {
      background: "#fff",
      color: C.g700,
      border: `1.5px solid ${C.g200}`
    },
    ghost: {
      background: "transparent",
      color: C.g500,
      border: "none"
    },
    dark: {
      background: C.g800,
      color: "#fff",
      border: "none"
    },
    success: {
      background: C.green,
      color: "#fff",
      border: "none"
    },
    danger: {
      background: C.red,
      color: "#fff",
      border: "none"
    },
    warning: {
      background: C.yellow,
      color: "#fff",
      border: "none"
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    style: {
      ...sz,
      ...v,
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: 700,
      fontFamily: "inherit",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      transition: "opacity .15s",
      width: full ? "100%" : undefined,
      ...st
    },
    onMouseEnter: e => e.currentTarget.style.opacity = ".85",
    onMouseLeave: e => e.currentTarget.style.opacity = "1"
  }, props), children);
};

/* ══════════════════════════════════════════════════
   CARD
══════════════════════════════════════════════════ */
const Card = ({
  children,
  style,
  onClick
}) => /*#__PURE__*/React.createElement("div", {
  onClick: onClick,
  style: {
    background: "#fff",
    border: `1px solid ${C.g200}`,
    borderRadius: 16,
    padding: "22px 24px",
    ...style
  }
}, children);

/* ══════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════ */
const StatCard = ({
  icon,
  label,
  value,
  sub,
  color,
  subPositive = true
}) => /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 42,
    height: 42,
    background: color + "20",
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    marginBottom: 12
  }
}, icon), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: C.g400,
    marginBottom: 4
  }
}, label), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 24,
    fontWeight: 900,
    color: C.g800
  }
}, value), sub && /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: subPositive ? C.green : C.red,
    marginTop: 4
  }
}, subPositive ? "↑" : "↓", " ", sub));

/* ══════════════════════════════════════════════════
   INPUT
══════════════════════════════════════════════════ */
const Input = ({
  label,
  required,
  hint,
  ...props
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    marginBottom: 16
  }
}, label && /*#__PURE__*/React.createElement("label", {
  style: {
    display: "block",
    fontSize: 13,
    color: C.g600,
    marginBottom: 7,
    fontWeight: 600
  }
}, label, required && /*#__PURE__*/React.createElement("span", {
  style: {
    color: C.primary
  }
}, " *")), /*#__PURE__*/React.createElement("input", _extends({
  style: {
    width: "100%",
    border: `1.5px solid ${C.g200}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
    color: C.g800,
    background: "#fff"
  },
  onFocus: e => e.target.style.borderColor = C.primary,
  onBlur: e => e.target.style.borderColor = C.g200
}, props)), hint && /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: C.g400,
    marginTop: 5
  }
}, hint));

/* ══════════════════════════════════════════════════
   SELECT
══════════════════════════════════════════════════ */
const Select = ({
  label,
  required,
  options,
  hint,
  ...props
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    marginBottom: 16
  }
}, label && /*#__PURE__*/React.createElement("label", {
  style: {
    display: "block",
    fontSize: 13,
    color: C.g600,
    marginBottom: 7,
    fontWeight: 600
  }
}, label, required && /*#__PURE__*/React.createElement("span", {
  style: {
    color: C.primary
  }
}, " *")), /*#__PURE__*/React.createElement("select", _extends({
  style: {
    width: "100%",
    background: "#fff",
    border: `1.5px solid ${C.g200}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    color: C.g700,
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer"
  }
}, props), options.map(o => /*#__PURE__*/React.createElement("option", {
  key: o.value ?? o,
  value: o.value ?? o
}, o.label ?? o))), hint && /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: C.g400,
    marginTop: 5
  }
}, hint));

/* ══════════════════════════════════════════════════
   TEXTAREA
══════════════════════════════════════════════════ */
const Textarea = ({
  label,
  required,
  rows = 4,
  ...props
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    marginBottom: 16
  }
}, label && /*#__PURE__*/React.createElement("label", {
  style: {
    display: "block",
    fontSize: 13,
    color: C.g600,
    marginBottom: 7,
    fontWeight: 600
  }
}, label, required && /*#__PURE__*/React.createElement("span", {
  style: {
    color: C.primary
  }
}, " *")), /*#__PURE__*/React.createElement("textarea", _extends({
  rows: rows,
  style: {
    width: "100%",
    border: `1.5px solid ${C.g200}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
    color: C.g800,
    resize: "vertical"
  },
  onFocus: e => e.target.style.borderColor = C.primary,
  onBlur: e => e.target.style.borderColor = C.g200
}, props)));

/* ══════════════════════════════════════════════════
   STEP WIZARD HEADER
══════════════════════════════════════════════════ */
const StepHeader = ({
  steps,
  current
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: 36,
    padding: "0 4px"
  }
}, steps.map((step, i) => {
  const n = i + 1,
    done = current > n,
    active = current === n;
  return /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: "flex",
      alignItems: "flex-start",
      flex: n < steps.length ? 1 : "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      border: `2px solid ${done || active ? C.primary : C.g300}`,
      background: done || active ? C.primary : "#fff",
      color: done || active ? "#fff" : C.g400,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 15,
      transition: "all .3s"
    }
  }, done ? "✓" : n), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      width: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: active ? C.primary : done ? C.g700 : C.g400
    }
  }, step.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginTop: 2
    }
  }, step.sub))), n < steps.length && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 2,
      background: done ? C.primary : C.g200,
      marginTop: 18,
      transition: "all .3s"
    }
  }));
}));

/* ══════════════════════════════════════════════════
   PAGE SHELL  (breadcrumb + title + action bar)
══════════════════════════════════════════════════ */
const PageShell = ({
  breadcrumb,
  title,
  subtitle,
  actions,
  children
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 28,
    fontFamily: "'Sora',sans-serif",
    minHeight: "100%",
    boxSizing: "border-box"
  }
}, breadcrumb && /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    color: C.g400,
    marginBottom: 6
  }
}, breadcrumb), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24
  }
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
  style: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
    color: C.g800
  }
}, title), subtitle && /*#__PURE__*/React.createElement("p", {
  style: {
    margin: "5px 0 0",
    fontSize: 13,
    color: C.g500
  }
}, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 10
  }
}, actions)), children);

/* ══════════════════════════════════════════════════
   DATA TABLE  (reusable)
══════════════════════════════════════════════════ */
const DataTable = ({
  cols,
  rows,
  emptyMsg = "No data found."
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    overflowX: "auto"
  }
}, /*#__PURE__*/React.createElement("table", {
  style: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
  style: {
    background: C.g50,
    borderBottom: `1px solid ${C.g200}`
  }
}, cols.map(c => /*#__PURE__*/React.createElement("th", {
  key: c.key || c.label,
  style: {
    padding: "10px 14px",
    textAlign: "left",
    color: C.g400,
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: "nowrap"
  }
}, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
  colSpan: cols.length,
  style: {
    padding: "40px",
    textAlign: "center",
    color: C.g400
  }
}, emptyMsg)) : rows.map((row, ri) => /*#__PURE__*/React.createElement("tr", {
  key: ri,
  style: {
    borderBottom: `1px solid ${C.g100}`
  }
}, cols.map(c => /*#__PURE__*/React.createElement("td", {
  key: c.key || c.label,
  style: {
    padding: "12px 14px",
    color: C.g700,
    ...c.style
  }
}, c.render ? c.render(row) : row[c.key])))))));

/* ══════════════════════════════════════════════════
   PAGINATION
══════════════════════════════════════════════════ */
const Pagination = ({
  total,
  showing,
  pages = ["‹", 1, 2, 3, "...", 60, "›"]
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    padding: "0 2px"
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: C.g400
  }
}, "Showing ", showing, " of ", total), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    gap: 6
  }
}, pages.map((p, i) => /*#__PURE__*/React.createElement("button", {
  key: i,
  style: {
    width: 32,
    height: 32,
    borderRadius: 7,
    border: `1px solid ${p === 1 ? C.primary : C.g200}`,
    background: p === 1 ? C.primary : "#fff",
    color: p === 1 ? "#fff" : C.g500,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit"
  }
}, p))));

/* ══════════════════════════════════════════════════
   MODAL WRAPPER
══════════════════════════════════════════════════ */
const Modal = ({
  title,
  onClose,
  children,
  width = 520
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: "#fff",
    borderRadius: 20,
    width,
    maxWidth: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 30
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  }
}, /*#__PURE__*/React.createElement("h2", {
  style: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    color: C.g800
  }
}, title), /*#__PURE__*/React.createElement("button", {
  onClick: onClose,
  style: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: C.g100,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}, "\u2715")), children));

/* ══════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════ */
const Avatar = ({
  initials,
  size = 40,
  gradient = true
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: size,
    height: size,
    borderRadius: "50%",
    background: gradient ? `linear-gradient(135deg,${C.primary},#ff6b7a)` : C.g200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: gradient ? "#fff" : C.g500,
    fontWeight: 800,
    fontSize: size * .35,
    flexShrink: 0
  }
}, initials);

/* ===== Layout.jsx ===== */

/* ════════════════════════════════════════════════
   USER NAV
════════════════════════════════════════════════ */
const USER_NAV = [{
  id: "dashboard",
  label: "Dashboard",
  icon: "⊞"
}, {
  id: "ad-accounts",
  label: "Ad Accounts",
  icon: "◧"
}, {
  id: "pre-verified",
  label: "Pre-Verified Accounts",
  icon: "✓",
  badge: "HOT"
}, {
  id: "media-buyers",
  label: "Media Buyers",
  icon: "👤"
}, {
  id: "projects",
  label: "Projects",
  icon: "📋"
}, {
  id: "balance",
  label: "Balance",
  icon: "◈"
}, {
  id: "support",
  label: "Support",
  icon: "💬"
}];

/* ════════════════════════════════════════════════
   ADMIN NAV
════════════════════════════════════════════════ */
const ADMIN_NAV = [{
  id: "admin-dashboard",
  label: "Dashboard",
  icon: "⊞"
}, {
  id: "admin-users",
  label: "Users",
  icon: "👥"
}, {
  id: "admin-ad-accounts",
  label: "Ad Accounts",
  icon: "◧"
}, {
  id: "admin-inventory",
  label: "Pre-Verified Accounts",
  icon: "✓"
}, {
  id: "admin-media-buyers",
  label: "Media Buyers",
  icon: "👤",
  badge: "NEW"
}, {
  id: "admin-orders",
  label: "Orders",
  icon: "⊡"
}, {
  id: "admin-deposits",
  label: "Deposits",
  icon: "↓"
}, {
  id: "admin-tickets",
  label: "Support Tickets",
  icon: "💬"
}, {
  id: "admin-reports",
  label: "Reports",
  icon: "📊"
}, {
  id: "admin-settings",
  label: "System Settings",
  icon: "⚙"
}];

/* ════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════ */
function Sidebar({
  role,
  activePage,
  setActivePage,
  logout
}) {
  const items = role === "admin" ? ADMIN_NAV : USER_NAV;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 224,
      minWidth: 224,
      background: C.sidebar,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 18px 16px",
      borderBottom: "1px solid rgba(255,255,255,.07)"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "sm"
  }), role === "admin" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: "rgba(232,25,44,.15)",
      border: "1px solid rgba(232,25,44,.3)",
      borderRadius: 20,
      padding: "3px 10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: C.primary
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      color: C.primary,
      letterSpacing: 1
    }
  }, "SUPER ADMIN"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: "10px 8px",
      overflowY: "auto"
    }
  }, items.map(item => {
    const active = activePage === item.id;
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      onClick: () => setActivePage(item.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 10,
        cursor: "pointer",
        margin: "1px 0",
        background: active ? "rgba(232,25,44,.15)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,.5)",
        fontWeight: active ? 700 : 400,
        fontSize: 13,
        transition: "all .15s",
        borderLeft: active ? `3px solid ${C.primary}` : "3px solid transparent"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        width: 18,
        textAlign: "center",
        flexShrink: 0
      }
    }, item.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, item.label), item.badge && /*#__PURE__*/React.createElement("span", {
      style: {
        background: C.primary,
        color: "#fff",
        fontSize: 9,
        fontWeight: 800,
        padding: "2px 7px",
        borderRadius: 20
      }
    }, item.badge));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 8px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(232,25,44,.1)",
      border: "1px solid rgba(232,25,44,.2)",
      borderRadius: 12,
      padding: "14px 12px",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12,
      color: "#fff",
      marginBottom: 3
    }
  }, "Need help?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,.4)",
      marginBottom: 10
    }
  }, "Support team available 24/7"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setActivePage("support"),
    style: {
      width: "100%",
      background: "rgba(255,255,255,.08)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,.15)",
      borderRadius: 8,
      padding: "7px 0",
      fontSize: 12,
      cursor: "pointer",
      fontWeight: 600
    }
  }, "Contact Support")), /*#__PURE__*/React.createElement("button", {
    onClick: logout,
    style: {
      width: "100%",
      background: "transparent",
      border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 8,
      padding: "8px 0",
      fontSize: 12,
      color: "rgba(255,255,255,.35)",
      cursor: "pointer",
      fontWeight: 500
    }
  }, "\u2190 Logout")));
}

/* ════════════════════════════════════════════════
   TOP BAR
════════════════════════════════════════════════ */
function TopBar({
  role,
  user,
  balance
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 62,
      background: "#fff",
      borderBottom: `1px solid ${C.g200}`,
      display: "flex",
      alignItems: "center",
      padding: "0 26px",
      gap: 16,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 10,
      padding: "9px 14px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g400,
      fontSize: 14
    }
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g400,
      fontSize: 13
    }
  }, "Search anything..."), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 11,
      color: C.g400,
      background: C.g100,
      padding: "2px 7px",
      borderRadius: 5
    }
  }, "\u2318K"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, role !== "admin" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      background: "#fef2f3",
      border: "1px solid rgba(232,25,44,.2)",
      borderRadius: 10,
      padding: "7px 16px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: C.g500
    }
  }, "Balance"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 900,
      color: C.primary
    }
  }, "$", balance.toLocaleString("en-US", {
    minimumFractionDigits: 2
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      background: C.g100,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 17
    }
  }, "\uD83D\uDD14"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 17,
      height: 17,
      background: C.primary,
      borderRadius: "50%",
      fontSize: 9,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800
    }
  }, "3")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      background: `linear-gradient(135deg,${C.primary},#ff6b7a)`,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 800,
      fontSize: 14,
      flexShrink: 0
    }
  }, user.name.split(" ").map(w => w[0]).join("").slice(0, 2)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: C.g800
    }
  }, user.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400
    }
  }, user.email)))));
}

/* ===== UserLoginPage.jsx ===== */

/* ═══════════════════════════════════════════════════
   USER LOGIN
   - Clean sign-in page for clients
   - No mention of admin anywhere
═══════════════════════════════════════════════════ */
function UserLoginPage({
  onLogin,
  goToAdmin
}) {
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin("user", {
        name: "John Doe",
        email
      });
    }, 700);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: `linear-gradient(135deg,#18080d 0%,#2d1018 40%,#18080d 100%)`,
      display: "flex",
      fontFamily: "'Sora',sans-serif"
    }
  }, /*#__PURE__*/React.createElement("link", {
    href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap",
    rel: "stylesheet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "60px 70px",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 50
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 36,
      fontWeight: 900,
      margin: "0 0 14px",
      lineHeight: 1.2
    }
  }, "Scale Your Ads.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary
    }
  }, "Faster.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: "rgba(255,255,255,.5)",
      maxWidth: 400,
      lineHeight: 1.8,
      margin: "0 0 40px"
    }
  }, "Access pre-verified ad accounts, hire expert media buyers, and manage all your advertising in one place."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, [["🎯", "Pre-Verified Ad Accounts", "Meta, Google, TikTok & Snapchat — ready to run"], ["👤", "Expert Media Buyers", "Hire certified professionals for your campaigns"], ["📊", "Real-Time Tracking", "Monitor performance and scale with confidence"]].map(([ic, t, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      gap: 14,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      background: "rgba(232,25,44,.15)",
      border: "1px solid rgba(232,25,44,.3)",
      borderRadius: 11,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      flexShrink: 0
    }
  }, ic), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: "#fff"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,.4)",
      marginTop: 3
    }
  }, s))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 480,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 50px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      background: "#fff",
      borderRadius: 24,
      padding: "40px 36px",
      boxShadow: "0 40px 80px rgba(0,0,0,.4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 30
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 6px",
      fontSize: 24,
      fontWeight: 900,
      color: C.g800
    }
  }, "Welcome back!"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: C.g500
    }
  }, "Sign in to your account to continue")), /*#__PURE__*/React.createElement(Input, {
    label: "Email Address",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "your@email.com"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), error && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.redL,
      color: C.red,
      padding: "10px 14px",
      borderRadius: 9,
      fontSize: 13,
      marginBottom: 16
    }
  }, error), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      marginTop: -8,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: C.primary,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "Forgot password?")), /*#__PURE__*/React.createElement(Btn, {
    full: true,
    size: "lg",
    onClick: submit,
    style: {
      marginBottom: 18
    }
  }, loading ? "Signing in…" : "Sign In →"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: 13,
      color: C.g500
    }
  }, "Don't have an account?", " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "Create Account")), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${C.g100}`,
      marginTop: 24,
      paddingTop: 16,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.g300
    }
  }, "Demo credentials are pre-filled \u2014 just click Sign In")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.g400
    }
  }, "Are you an admin?", " "), /*#__PURE__*/React.createElement("span", {
    onClick: goToAdmin,
    style: {
      fontSize: 12,
      color: C.primary,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "Admin Login \u2192")))));
}

/* ===== RegisterPage.jsx ===== */

/* ═══════════════════════════════════════════════════
   USER REGISTER — Create Account
   Multi-step: Account Info → Business Info → Done
═══════════════════════════════════════════════════ */
const STEPS = [{
  label: "Account Info",
  sub: "Your personal details"
}, {
  label: "Business Info",
  sub: "Your company details"
}, {
  label: "Confirm",
  sub: "Review & finish"
}];
function StepDots({
  current
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: 36
    }
  }, STEPS.map((s, i) => {
    const n = i + 1,
      done = current > n,
      active = current === n;
    return /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        alignItems: "flex-start",
        flex: n < STEPS.length ? 1 : "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: `2px solid ${done || active ? C.primary : C.g300}`,
        background: done || active ? C.primary : "#fff",
        color: done || active ? "#fff" : C.g400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 15,
        transition: "all .3s"
      }
    }, done ? "✓" : n), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        width: 90
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: active ? C.primary : done ? C.g600 : C.g400
      }
    }, s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: C.g400,
        marginTop: 1
      }
    }, s.sub))), n < STEPS.length && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 2,
        background: done ? C.primary : C.g200,
        marginTop: 17,
        transition: "all .3s"
      }
    }));
  }));
}

/* ── Step 1: Account Info ── */
function Step1({
  data,
  set,
  onNext
}) {
  const ok = data.firstName && data.lastName && data.email && data.password && data.confirm;
  const passwordMatch = data.password === data.confirm;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "First Name",
    required: true,
    value: data.firstName,
    onChange: e => set("firstName", e.target.value),
    placeholder: "John"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Last Name",
    required: true,
    value: data.lastName,
    onChange: e => set("lastName", e.target.value),
    placeholder: "Doe"
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Email Address",
    required: true,
    type: "email",
    value: data.email,
    onChange: e => set("email", e.target.value),
    placeholder: "john@example.com"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Phone Number",
    type: "tel",
    value: data.phone,
    onChange: e => set("phone", e.target.value),
    placeholder: "+1 555 123 4567"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    required: true,
    type: "password",
    value: data.password,
    onChange: e => set("password", e.target.value),
    placeholder: "Min. 8 characters"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Confirm Password",
    required: true,
    type: "password",
    value: data.confirm,
    onChange: e => set("confirm", e.target.value),
    placeholder: "Repeat password"
  })), data.confirm && !passwordMatch && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.redL,
      color: C.red,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      marginBottom: 16
    }
  }, "Passwords do not match."), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 20,
      fontSize: 13,
      color: C.g500,
      lineHeight: 1.6
    }
  }, "By creating an account you agree to our ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "Terms of Service"), " and ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "Privacy Policy"), "."), /*#__PURE__*/React.createElement(Btn, {
    full: true,
    size: "lg",
    onClick: () => ok && passwordMatch && onNext(),
    style: {
      opacity: ok && passwordMatch ? 1 : .4,
      cursor: ok && passwordMatch ? "pointer" : "default"
    }
  }, "Continue \u2192"));
}

/* ── Step 2: Business Info ── */
function Step2({
  data,
  set,
  onNext,
  onBack
}) {
  const ok = data.businessName && data.businessType && data.country;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
    label: "Business / Agency Name",
    required: true,
    value: data.businessName,
    onChange: e => set("businessName", e.target.value),
    placeholder: "My Agency LLC"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Business Type",
    required: true,
    value: data.businessType,
    onChange: e => set("businessType", e.target.value),
    options: ["", "Marketing Agency", "E-Commerce Brand", "Freelancer", "Startup", "Enterprise", "Other"]
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Country",
    required: true,
    value: data.country,
    onChange: e => set("country", e.target.value),
    options: ["", "United States", "United Kingdom", "France", "Germany", "Morocco", "UAE", "Saudi Arabia", "Canada", "Australia", "Other"]
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Website (Optional)",
    value: data.website,
    onChange: e => set("website", e.target.value),
    placeholder: "https://myagency.com"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "How did you hear about us?",
    value: data.referral,
    onChange: e => set("referral", e.target.value),
    placeholder: "Google, friend, social media\u2026"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    size: "lg",
    style: {
      flex: 1
    },
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/React.createElement(Btn, {
    size: "lg",
    style: {
      flex: 2,
      opacity: ok ? 1 : .4,
      cursor: ok ? "pointer" : "default"
    },
    onClick: () => ok && onNext()
  }, "Continue \u2192")));
}

/* ── Step 3: Confirm ── */
function Step3({
  data,
  onDone,
  onBack
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "10px 0 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      background: C.greenL,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 34,
      margin: "0 auto 18px"
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: C.g800,
      margin: "0 0 8px"
    }
  }, "You're all set!"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: C.g500,
      margin: "0 0 28px"
    }
  }, "Review your details before finishing.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      borderRadius: 13,
      padding: "18px 20px",
      marginBottom: 24
    }
  }, [["Name", `${data.firstName} ${data.lastName}`], ["Email", data.email], ["Phone", data.phone || "—"], ["Business", data.businessName], ["Type", data.businessType], ["Country", data.country], ["Website", data.website || "—"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "9px 0",
      borderBottom: `1px solid ${C.g200}`,
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g500,
      fontWeight: 600
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g800,
      fontWeight: 700
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    size: "lg",
    style: {
      flex: 1
    },
    onClick: onBack
  }, "\u2190 Edit"), /*#__PURE__*/React.createElement(Btn, {
    size: "lg",
    style: {
      flex: 2
    },
    onClick: onDone
  }, "\uD83C\uDF89 Create My Account")));
}

/* ── Main Register component ── */
function RegisterPage({
  onLogin,
  goToLogin
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    businessName: "",
    businessType: "",
    country: "",
    website: "",
    referral: ""
  });
  const set = (k, v) => setData(p => ({
    ...p,
    [k]: v
  }));
  const handleDone = () => {
    onLogin("user", {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: `linear-gradient(135deg,#18080d 0%,#2d1018 40%,#18080d 100%)`,
      display: "flex",
      fontFamily: "'Sora',sans-serif"
    }
  }, /*#__PURE__*/React.createElement("link", {
    href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap",
    rel: "stylesheet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "60px 70px",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 50
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 34,
      fontWeight: 900,
      margin: "0 0 14px",
      lineHeight: 1.2
    }
  }, "Start Advertising", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary
    }
  }, "Smarter Today.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: "rgba(255,255,255,.5)",
      maxWidth: 400,
      lineHeight: 1.8,
      margin: "0 0 36px"
    }
  }, "Join thousands of advertisers who trust AdverSolutions to manage and scale their ad campaigns."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, [["✅", "Free to sign up", "No setup fees or hidden charges"], ["⚡", "Instant access", "Start ordering accounts right away"], ["🔒", "Secure & encrypted", "Your data and credentials are always protected"], ["🎯", "Verified accounts", "Every account is pre-tested and ready to run"]].map(([ic, t, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      gap: 14,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      background: "rgba(232,25,44,.15)",
      border: "1px solid rgba(232,25,44,.3)",
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 17,
      flexShrink: 0
    }
  }, ic), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: "#fff"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,.4)",
      marginTop: 2
    }
  }, s))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 520,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 50px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      background: "#fff",
      borderRadius: 24,
      padding: "40px 36px",
      boxShadow: "0 40px 80px rgba(0,0,0,.4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 6px",
      fontSize: 24,
      fontWeight: 900,
      color: C.g800
    }
  }, "Create your account"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14,
      color: C.g500
    }
  }, "Already have an account?", " ", /*#__PURE__*/React.createElement("span", {
    onClick: goToLogin,
    style: {
      color: C.primary,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "Sign in"))), /*#__PURE__*/React.createElement(StepDots, {
    current: step
  }), step === 1 && /*#__PURE__*/React.createElement(Step1, {
    data: data,
    set: set,
    onNext: () => setStep(2)
  }), step === 2 && /*#__PURE__*/React.createElement(Step2, {
    data: data,
    set: set,
    onNext: () => setStep(3),
    onBack: () => setStep(1)
  }), step === 3 && /*#__PURE__*/React.createElement(Step3, {
    data: data,
    onDone: handleDone,
    onBack: () => setStep(2)
  }))));
}

/* ===== AdminLoginPage.jsx ===== */

/* ═══════════════════════════════════════════════════
   ADMIN LOGIN
   - Separate dark portal, no link from user login
   - Brute-force protection (5 attempt limit)
═══════════════════════════════════════════════════ */
function AdminLoginPage({
  onLogin,
  goToUserLogin
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const blocked = attempts >= 5;
  const submit = () => {
    if (blocked) {
      setError("Too many failed attempts. Please contact support.");
      return;
    }
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email === ADMIN_CREDS.email && password === ADMIN_CREDS.password) {
        onLogin("admin", {
          name: "Super Admin",
          email
        });
      } else {
        const left = 5 - attempts - 1;
        setAttempts(p => p + 1);
        setError(`Invalid credentials. ${left} attempt${left !== 1 ? "s" : ""} remaining.`);
      }
    }, 800);
  };
  const darkInput = {
    width: "100%",
    background: "rgba(255,255,255,.05)",
    border: "1.5px solid rgba(255,255,255,.1)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 14,
    color: "#fff",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "#0d0d14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Sora',sans-serif",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("link", {
    href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap",
    rel: "stylesheet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 460
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "md"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(232,25,44,.1)",
      border: "1px solid rgba(232,25,44,.25)",
      borderRadius: 30,
      padding: "6px 16px",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: "#e88",
      letterSpacing: 1
    }
  }, "RESTRICTED ACCESS")), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: "#fff",
      fontSize: 26,
      fontWeight: 900,
      margin: "0 0 8px"
    }
  }, "Admin Portal"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,.4)",
      fontSize: 14,
      margin: 0
    }
  }, "Authorized personnel only")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#1a1a2e",
      border: "1px solid rgba(255,255,255,.07)",
      borderRadius: 20,
      padding: "36px",
      boxShadow: "0 40px 80px rgba(0,0,0,.5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 13,
      color: "rgba(255,255,255,.5)",
      marginBottom: 7,
      fontWeight: 600
    }
  }, "Admin Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "admin@adversolutions.com",
    style: darkInput,
    onFocus: e => e.target.style.borderColor = C.primary,
    onBlur: e => e.target.style.borderColor = "rgba(255,255,255,.1)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 13,
      color: "rgba(255,255,255,.5)",
      marginBottom: 7,
      fontWeight: 600
    }
  }, "Admin Password"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    style: darkInput,
    onFocus: e => e.target.style.borderColor = C.primary,
    onBlur: e => e.target.style.borderColor = "rgba(255,255,255,.1)",
    onKeyDown: e => e.key === "Enter" && submit()
  })), error && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(239,68,68,.1)",
      border: "1px solid rgba(239,68,68,.3)",
      color: "#fca5a5",
      padding: "10px 14px",
      borderRadius: 9,
      fontSize: 13,
      marginBottom: 18
    }
  }, error), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "rgba(245,158,11,.08)",
      border: "1px solid rgba(245,158,11,.2)",
      borderRadius: 9,
      padding: "10px 14px",
      marginBottom: 22,
      fontSize: 12,
      color: "#fbbf24"
    }
  }, "\uD83D\uDD11 Demo: admin@adversolutions.com / admin2024"), /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: loading || blocked,
    style: {
      width: "100%",
      background: loading || blocked ? C.g600 : C.primary,
      color: "#fff",
      border: "none",
      borderRadius: 10,
      padding: "13px 0",
      fontSize: 15,
      fontWeight: 900,
      cursor: loading || blocked ? "default" : "pointer",
      fontFamily: "inherit",
      marginBottom: 14,
      transition: "all .2s"
    }
  }, loading ? "Authenticating…" : "Access Admin Panel →"), /*#__PURE__*/React.createElement("button", {
    onClick: goToUserLogin,
    style: {
      width: "100%",
      background: "transparent",
      border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 10,
      padding: "11px 0",
      fontSize: 13,
      color: "rgba(255,255,255,.35)",
      cursor: "pointer",
      fontFamily: "inherit"
    }
  }, "\u2190 Back to User Login")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginTop: 20,
      fontSize: 12,
      color: "rgba(255,255,255,.15)"
    }
  }, "Unauthorized access is monitored and prosecuted")));
}

/* ===== UserDashboard.jsx ===== */

/* ═══════════════════════════════════════════════════
   USER DASHBOARD
═══════════════════════════════════════════════════ */
function UserDashboard({
  balance,
  setPage
}) {
  const recentOrders = [{
    id: "#ORD-250519",
    platform: "Meta",
    type: "New Ad Account",
    amount: 120,
    status: "completed",
    date: "May 19, 2024"
  }, {
    id: "#ORD-250518",
    platform: "Google",
    type: "New Ad Account",
    amount: 150,
    status: "processing",
    date: "May 18, 2024"
  }, {
    id: "#ORD-250517",
    platform: "TikTok",
    type: "Pre-Verified Account",
    amount: 95,
    status: "pending",
    date: "May 17, 2024"
  }, {
    id: "#ORD-250515",
    platform: "Snapchat",
    type: "New Ad Account",
    amount: 90,
    status: "completed",
    date: "May 15, 2024"
  }];
  const announcements = [{
    icon: "📢",
    title: "New: TikTok Ads Accounts",
    body: "TikTok accounts are now available!",
    date: "May 20, 2024"
  }, {
    icon: "🛡️",
    title: "System Update",
    body: "Updated security measures for better protection.",
    date: "May 18, 2024"
  }, {
    icon: "🎁",
    title: "Special Offer",
    body: "Get 10% bonus on your next top up over $500!",
    date: "May 15, 2024"
  }];
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Welcome back, John! \uD83D\uDC4B",
    subtitle: "Here's what's happening with your account today."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 310px",
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 14,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    icon: "\u25C8",
    label: "Current Balance",
    value: `$${balance.toFixed(2)}`,
    sub: "12.5% from last week",
    color: C.primary
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "\uD83D\uDCCA",
    label: "Total Spend",
    value: "$5,430.60",
    sub: "18.3% from last week",
    color: C.blue
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "\uD83D\uDDA5",
    label: "Total Accounts",
    value: "12",
    sub: "2 new this week",
    color: C.green
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: "\u23F1",
    label: "Pending Orders",
    value: "3",
    color: C.yellow
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 18px",
      fontSize: 15,
      fontWeight: 800,
      color: C.g800
    }
  }, "Quick Actions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 12
    }
  }, [[C.primary, "➕", "Create Ad Account", "Request new ad account", "ad-accounts"], [C.green, "◈", "Top Up Balance", "Add funds to account", "balance"], [C.blue, "🛒", "Buy Verified Account", "Browse accounts", "pre-verified"], [C.yellow, "👤", "Hire Media Buyer", "Find expert media buyers", "media-buyers"]].map(([col, ic, l, s, pg]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    onClick: () => setPage(pg),
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 13,
      padding: "16px 12px",
      cursor: "pointer",
      textAlign: "center",
      transition: "all .15s"
    },
    onMouseEnter: e => {
      e.currentTarget.style.borderColor = col;
      e.currentTarget.style.background = col + "0d";
    },
    onMouseLeave: e => {
      e.currentTarget.style.borderColor = C.g200;
      e.currentTarget.style.background = C.g50;
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      background: col + "20",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 22,
      margin: "0 auto 10px"
    }
  }, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: C.g700,
      marginBottom: 3
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400
    }
  }, s))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 800,
      color: C.g800
    }
  }, "Recent Orders"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    size: "sm",
    onClick: () => setPage("ad-accounts")
  }, "View all \u2192")), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: `1px solid ${C.g200}`
    }
  }, ["Order ID", "Platform", "Type", "Amount", "Status", "Date"].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: "8px 10px",
      textAlign: "left",
      color: C.g400,
      fontWeight: 700,
      fontSize: 12
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, recentOrders.map(row => /*#__PURE__*/React.createElement("tr", {
    key: row.id,
    style: {
      borderBottom: `1px solid ${C.g100}`
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "12px 10px",
      fontWeight: 700,
      color: C.g700
    }
  }, row.id), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "12px 10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: row.platform
  }), row.platform)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "12px 10px",
      color: C.g500
    }
  }, row.type), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "12px 10px",
      fontWeight: 700
    }
  }, "$", row.amount, ".00"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "12px 10px"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    status: row.status
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "12px 10px",
      color: C.g400
    }
  }, row.date))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 800,
      color: C.g800
    }
  }, "Announcements"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary,
      fontSize: 12,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "View all")), announcements.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 11,
      padding: "11px 0",
      borderBottom: i < announcements.length - 1 ? `1px solid ${C.g100}` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      background: C.primaryLight,
      borderRadius: 9,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      flexShrink: 0
    }
  }, a.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: C.g800,
      marginBottom: 2
    }
  }, a.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g500,
      marginBottom: 3
    }
  }, a.body), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g300
    }
  }, a.date))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 12px",
      fontSize: 14,
      fontWeight: 800,
      color: C.g800
    }
  }, "Balance Overview"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 4
    }
  }, "Current Balance"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      fontWeight: 900,
      color: C.primary,
      marginBottom: 16
    }
  }, "$", balance.toFixed(2)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400
    }
  }, "Pending"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: C.yellow
    }
  }, "$320.00")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400
    }
  }, "Total Deposits"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: C.green
    }
  }, "$2,850.00"))), /*#__PURE__*/React.createElement(Btn, {
    full: true,
    onClick: () => setPage("balance")
  }, "\u25C8 Top Up Balance")))));
}

/* ===== AdAccountsPage.jsx ===== */

/* ══════════════════════════════════════════════════
   CREATE AD ACCOUNT  — 5-step wizard, one page at a time
══════════════════════════════════════════════════ */
const WIZARD_STEPS = [{
  label: "Choose Platform",
  sub: "Select ad platform"
}, {
  label: "Account Details",
  sub: "Basic information"
}, {
  label: "Business Info",
  sub: "Your business details"
}, {
  label: "Review & Payment",
  sub: "Confirm & pay"
}, {
  label: "Confirmation",
  sub: "Track your request"
}];

/* Step 1 — Pick platform */
function WizardStep1({
  data,
  set,
  onNext
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 700,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 6px",
      fontSize: 19,
      fontWeight: 900,
      color: C.g800
    }
  }, "Choose Your Platform"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 26px",
      fontSize: 14,
      color: C.g500
    }
  }, "Select the advertising platform for which you want an agency ad account."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 30
    }
  }, PLATFORMS.map(p => {
    const sel = data.platform === p.id;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      onClick: () => set("platform", p.id),
      style: {
        border: `2px solid ${sel ? C.primary : C.g200}`,
        borderRadius: 14,
        padding: "22px 20px",
        cursor: "pointer",
        background: sel ? C.primaryLight : "#fff",
        transition: "all .2s",
        position: "relative"
      }
    }, sel && /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: 14,
        right: 14,
        width: 22,
        height: 22,
        background: C.primary,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 12,
        fontWeight: 900
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(PlatformIcon, {
      name: p.icon,
      size: 32
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 900,
        fontSize: 16,
        color: C.g800,
        marginBottom: 4
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: C.g500
      }
    }, p.sub));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    size: "lg",
    style: {
      minWidth: 160,
      opacity: data.platform ? 1 : .4,
      cursor: data.platform ? "pointer" : "default"
    },
    onClick: () => data.platform && onNext()
  }, "Continue \u2192")), !data.platform && /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: "right",
      fontSize: 12,
      color: C.g400,
      margin: "8px 0 0"
    }
  }, "Please select a platform to continue")));
}

/* Step 2 — Account details */
function WizardStep2({
  data,
  set,
  onNext,
  onBack
}) {
  const ok = data.accountName && data.timezone && data.currency;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 700,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 6px",
      fontSize: 19,
      fontWeight: 900,
      color: C.g800
    }
  }, "Account Details"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 24px",
      fontSize: 14,
      color: C.g500
    }
  }, "Enter basic information for your ad account."), /*#__PURE__*/React.createElement(Input, {
    label: "Account Name",
    required: true,
    value: data.accountName,
    onChange: e => set("accountName", e.target.value),
    placeholder: "e.g. My Agency Account"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Timezone",
    required: true,
    value: data.timezone,
    onChange: e => set("timezone", e.target.value),
    options: ["(GMT+00:00) UTC", "(GMT-05:00) Eastern Time (US)", "(GMT-08:00) Pacific Time (US)", "(GMT+01:00) Central European Time", "(GMT+01:00) Casablanca (WET)", "(GMT+03:00) Riyadh (AST)"]
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Currency",
    required: true,
    value: data.currency,
    onChange: e => set("currency", e.target.value),
    options: ["USD – US Dollar", "EUR – Euro", "GBP – British Pound", "AED – UAE Dirham", "MAD – Moroccan Dirham", "SAR – Saudi Riyal"]
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Website (Optional)",
    value: data.website,
    onChange: e => set("website", e.target.value),
    placeholder: "https://myagency.com",
    hint: "Your agency or business website"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    size: "lg",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/React.createElement(Btn, {
    size: "lg",
    style: {
      minWidth: 160,
      opacity: ok ? 1 : .4,
      cursor: ok ? "pointer" : "default"
    },
    onClick: () => ok && onNext()
  }, "Continue \u2192"))));
}

/* Step 3 — Business info */
function WizardStep3({
  data,
  set,
  onNext,
  onBack
}) {
  const ok = data.businessName && data.businessType && data.businessEmail;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 700,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 6px",
      fontSize: 19,
      fontWeight: 900,
      color: C.g800
    }
  }, "Business Information"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 24px",
      fontSize: 14,
      color: C.g500
    }
  }, "Provide your business details for account verification."), /*#__PURE__*/React.createElement(Input, {
    label: "Business Name",
    required: true,
    value: data.businessName,
    onChange: e => set("businessName", e.target.value),
    placeholder: "e.g. My Agency LLC"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Business Type",
    required: true,
    value: data.businessType,
    onChange: e => set("businessType", e.target.value),
    options: ["", "Marketing Agency", "E-Commerce Brand", "Freelancer", "Startup", "Enterprise", "Other"]
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Country",
    required: true,
    value: data.country,
    onChange: e => set("country", e.target.value),
    options: ["United States", "United Kingdom", "France", "Germany", "Morocco", "UAE", "Saudi Arabia", "Canada", "Australia"]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Business Email",
    required: true,
    type: "email",
    value: data.businessEmail,
    onChange: e => set("businessEmail", e.target.value),
    placeholder: "contact@myagency.com"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Phone Number",
    type: "tel",
    value: data.phone,
    onChange: e => set("phone", e.target.value),
    placeholder: "+1 555 123 4567"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    size: "lg",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/React.createElement(Btn, {
    size: "lg",
    style: {
      minWidth: 160,
      opacity: ok ? 1 : .4,
      cursor: ok ? "pointer" : "default"
    },
    onClick: () => ok && onNext()
  }, "Continue \u2192"))));
}

/* Step 4 — Review & pay */
function WizardStep4({
  data,
  onNext,
  onBack,
  balance
}) {
  const [payWithBalance, setPay] = useState(true);
  const platform = PLATFORMS.find(p => p.id === data.platform);
  const price = 50,
    fee = 2,
    total = price + fee;
  const canPay = balance >= total;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 700,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 6px",
      fontSize: 19,
      fontWeight: 900,
      color: C.g800
    }
  }, "Review & Payment"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 26px",
      fontSize: 14,
      color: C.g500
    }
  }, "Review your order details and complete the payment."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.g500,
      letterSpacing: .8,
      textTransform: "uppercase",
      marginBottom: 12
    }
  }, "Order Summary"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      borderRadius: 12,
      padding: "16px 18px"
    }
  }, [["Platform", /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: platform?.icon,
    size: 14
  }), platform?.name)], ["Account Name", data.accountName || "—"], ["Timezone", data.timezone], ["Currency", data.currency], ["Business Name", data.businessName || "—"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: `1px solid ${C.g200}`,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g500
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: C.g700,
      textAlign: "right",
      maxWidth: 180
    }
  }, v))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.g500,
      letterSpacing: .8,
      textTransform: "uppercase",
      marginBottom: 12
    }
  }, "Pricing"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      borderRadius: 12,
      padding: "16px 18px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: `1px solid ${C.g200}`,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g500
    }
  }, "Service Price"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, "$", price, ".00")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: `1px solid ${C.g200}`,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g500
    }
  }, "Processing Fee"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, "$", fee, ".00")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0 4px",
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      color: C.g800
    }
  }, "Total"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      color: C.primary
    }
  }, "$", total, ".00"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: canPay ? C.greenL : C.redL,
      border: `1px solid ${canPay ? C.green : C.red}30`,
      borderRadius: 12,
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: C.g700
    }
  }, "Pay with Balance"), /*#__PURE__*/React.createElement("div", {
    onClick: () => setPay(p => !p),
    style: {
      width: 44,
      height: 24,
      borderRadius: 12,
      background: payWithBalance ? C.primary : C.g300,
      cursor: "pointer",
      position: "relative",
      transition: "all .2s"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      background: "#fff",
      borderRadius: "50%",
      position: "absolute",
      top: 2,
      left: payWithBalance ? 22 : 2,
      transition: "all .2s",
      boxShadow: "0 1px 3px rgba(0,0,0,.2)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.g600
    }
  }, "Available: ", /*#__PURE__*/React.createElement("strong", null, "$", balance.toFixed(2)), !canPay && /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.red,
      fontWeight: 700
    }
  }, " \u2014 Insufficient balance"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    size: "lg",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/React.createElement(Btn, {
    size: "lg",
    style: {
      minWidth: 180,
      background: canPay ? C.primary : C.g300,
      cursor: canPay ? "pointer" : "default"
    },
    onClick: () => canPay && onNext()
  }, canPay ? `Pay $${total}.00 →` : "Insufficient Balance"))));
}

/* Step 5 — Confirmation */
function WizardStep5({
  data,
  onDone
}) {
  const platform = PLATFORMS.find(p => p.id === data.platform);
  const reqId = `#AAR-2024-${Math.floor(100000 + Math.random() * 900000)}`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 700,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "16px 0 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 72,
      height: 72,
      background: C.greenL,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 34,
      margin: "0 auto 20px"
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      color: C.g800,
      margin: "0 0 10px"
    }
  }, "Request Submitted!"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: C.g500,
      margin: "0 0 30px",
      maxWidth: 440,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, "Your agency ad account request has been received. We'll review it and notify you once it's ready."), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      borderRadius: 14,
      padding: "20px 24px",
      textAlign: "left",
      marginBottom: 28
    }
  }, [["Request ID", reqId], ["Platform", platform?.name], ["Account Name", data.accountName], ["Business", data.businessName], ["Date", new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })], ["Status", /*#__PURE__*/React.createElement(Badge, {
    status: "pending review"
  })]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: `1px solid ${C.g200}`,
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g500,
      fontWeight: 600
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: C.g700
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.primaryLight,
      border: `1px solid ${C.primary}20`,
      borderRadius: 14,
      padding: "20px 24px",
      textAlign: "left",
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.primary,
      marginBottom: 16,
      textTransform: "uppercase",
      letterSpacing: .8
    }
  }, "What happens next?"), [["Pending Review", "Your request is being reviewed", true], ["Processing", "We are preparing your ad account", false], ["Completed", "Your ad account is ready", false], ["Delivered", "Account details sent to you", false]].map(([t, s, act], i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      gap: 14,
      marginBottom: i < 3 ? 14 : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: act ? C.primary : C.g200,
      color: act ? "#fff" : C.g400,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 13,
      flexShrink: 0
    }
  }, i + 1), i < 3 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 2,
      height: 18,
      background: C.g200,
      marginTop: 3
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: act ? C.primary : C.g500
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400
    }
  }, s))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    size: "lg",
    onClick: onDone
  }, "View My Requests"), /*#__PURE__*/React.createElement(Btn, {
    size: "lg",
    onClick: onDone
  }, "Go to Dashboard \u2192")))));
}

/* ══════════════════════════════════════════════════
   CREATE AD ACCOUNT WIZARD — container
══════════════════════════════════════════════════ */
function CreateAdAccountWizard({
  onCancel,
  balance,
  setPage
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    platform: "",
    accountName: "",
    timezone: "(GMT+00:00) UTC",
    currency: "USD – US Dollar",
    website: "",
    businessName: "",
    businessType: "",
    country: "United States",
    businessEmail: "",
    phone: ""
  });
  const set = (k, v) => setData(p => ({
    ...p,
    [k]: v
  }));
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const done = () => setPage("dashboard");
  return /*#__PURE__*/React.createElement(PageShell, {
    breadcrumb: "Dashboard \u203A Ad Accounts \u203A Apply for Agency Account",
    title: "Apply for Agency Ad Account",
    subtitle: "Follow the steps below to submit your request",
    actions: step < 5 ? [/*#__PURE__*/React.createElement(Btn, {
      key: "cancel",
      variant: "outline",
      onClick: onCancel
    }, "\u2715 Cancel")] : undefined
  }, /*#__PURE__*/React.createElement(StepHeader, {
    steps: WIZARD_STEPS,
    current: step
  }), step === 1 && /*#__PURE__*/React.createElement(WizardStep1, {
    data: data,
    set: set,
    onNext: next
  }), step === 2 && /*#__PURE__*/React.createElement(WizardStep2, {
    data: data,
    set: set,
    onNext: next,
    onBack: back
  }), step === 3 && /*#__PURE__*/React.createElement(WizardStep3, {
    data: data,
    set: set,
    onNext: next,
    onBack: back
  }), step === 4 && /*#__PURE__*/React.createElement(WizardStep4, {
    data: data,
    onNext: next,
    onBack: back,
    balance: balance
  }), step === 5 && /*#__PURE__*/React.createElement(WizardStep5, {
    data: data,
    onDone: done
  }));
}

/* ══════════════════════════════════════════════════
   AD ACCOUNTS LIST PAGE
══════════════════════════════════════════════════ */
function AdAccountsPage({
  balance,
  setPage
}) {
  const [view, setView] = useState("list");
  if (view === "create") return /*#__PURE__*/React.createElement(CreateAdAccountWizard, {
    onCancel: () => setView("list"),
    balance: balance,
    setPage: setPage
  });
  const cols = [{
    label: "",
    render: () => /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    }),
    style: {
      width: 40
    }
  }, {
    label: "Account Name",
    render: r => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        color: C.g800
      }
    }, r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.g400
      }
    }, "ID: ", r.id))
  }, {
    label: "Platform",
    render: r => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(PlatformIcon, {
      name: r.platform
    }), r.platform)
  }, {
    label: "Type",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        background: r.type === "Agency Account" ? "#ede9fe" : "#dbeafe",
        color: r.type === "Agency Account" ? "#8b5cf6" : "#3b82f6",
        fontSize: 11,
        padding: "3px 9px",
        borderRadius: 20,
        fontWeight: 700
      }
    }, r.type)
  }, {
    label: "Created By",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g500
      }
    }, r.user)
  }, {
    label: "Balance",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700
      }
    }, "$", r.balance, ".00")
  }, {
    label: "Status",
    render: r => /*#__PURE__*/React.createElement(Badge, {
      status: r.status
    })
  }, {
    label: "Date",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g400
      }
    }, r.date)
  }, {
    label: "Actions",
    render: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\uD83D\uDC41"), /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\u270F\uFE0F"))
  }];
  return /*#__PURE__*/React.createElement(PageShell, {
    breadcrumb: "Dashboard \u203A Ad Accounts",
    title: "Ad Accounts",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "exp",
      variant: "outline"
    }, "\u2191 Export"), /*#__PURE__*/React.createElement(Btn, {
      key: "create",
      onClick: () => setView("create")
    }, "+ Create Ad Account")]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: 14,
      marginBottom: 22
    }
  }, [["Total", "2,346", C.blue], ["Active", "1,987", C.green], ["Disabled", "189", C.red], ["Pending", "170", C.yellow], ["Rejected", "56", C.g500]].map(([l, v, c]) => /*#__PURE__*/React.createElement(Card, {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 6
    }
  }, l, " Accounts"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      color: c
    }
  }, v)))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 18,
      alignItems: "flex-end"
    }
  }, [["Platform", ["All Platforms", "Meta", "Google", "TikTok", "Snapchat"]], ["Status", ["All Statuses", "Active", "Pending", "Disabled", "Rejected"]]].map(([l, o]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 5,
      fontWeight: 600
    }
  }, l), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }, o.map(opt => /*#__PURE__*/React.createElement("option", {
    key: opt
  }, opt))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "\uD83D\uDD0D Search accounts\u2026",
    style: {
      width: 240,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }))), /*#__PURE__*/React.createElement(DataTable, {
    cols: cols,
    rows: MOCK_AD_ACCOUNTS
  }), /*#__PURE__*/React.createElement(Pagination, {
    total: "2,346",
    showing: `1–${MOCK_AD_ACCOUNTS.length}`,
    pages: ["‹", 1, 2, 3, "...", 294, "›"]
  })));
}

/* ===== BalancePage.jsx ===== */

const PAYMENT_INFO = {
  "Payoneer": "adver@solution.com",
  "Wise (USD)": "adver@solution.com",
  "USDT (TRC20)": "TY8c...b3fD (click to copy)",
  "Binance": "456789852",
  "Bank Transfer": "XXXX XXXX XXXX 1234",
  "Other": "Contact support"
};

/* ═══════════════════════════════════════════════════
   BALANCE PAGE  —  top-up + transactions combined
═══════════════════════════════════════════════════ */
function BalancePage({
  balance,
  addTransaction
}) {
  const [payStep, setPayStep] = useState(1);
  const [method, setMethod] = useState("Payoneer");
  const [amount, setAmount] = useState("350.00");
  const [proof, setProof] = useState(false);
  const [txs, setTxs] = useState(MOCK_TRANSACTIONS);
  const [txFilter, setTxFilter] = useState("all");
  const [successBanner, setSuccessBanner] = useState(false);
  const filtered = txFilter === "all" ? txs : txs.filter(t => t.type.toLowerCase().includes(txFilter) || t.status === txFilter);
  const submitDeposit = () => {
    if (!proof) {
      alert("Please upload payment proof.");
      return;
    }
    const newTx = {
      id: Date.now(),
      type: "Deposit",
      method,
      amount: parseFloat(amount) || 0,
      status: "pending",
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    setTxs(p => [newTx, ...p]);
    if (addTransaction) addTransaction(newTx);
    setSuccessBanner(true);
    setPayStep(1);
    setProof(false);
    setAmount("350.00");
  };
  const txCols = [{
    label: "#",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.g400
      }
    }, r.id)
  }, {
    label: "Type",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: C.g700
      }
    }, r.type)
  }, {
    label: "Method",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: C.g500
      }
    }, r.method)
  }, {
    label: "Amount",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 900,
        color: r.amount < 0 ? C.red : C.green
      }
    }, r.amount < 0 ? "−" : "+", " $", Math.abs(r.amount).toFixed(2))
  }, {
    label: "Status",
    render: r => /*#__PURE__*/React.createElement(Badge, {
      status: r.status
    })
  }, {
    label: "Date",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g400
      }
    }, r.date)
  }, {
    label: "",
    render: () => /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\uD83D\uDC41")
  }];
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Balance & Transactions",
    subtitle: "Manage your account balance, top up, and view your full transaction history."
  }, successBanner && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.greenL,
      border: `1px solid ${C.green}40`,
      borderRadius: 13,
      padding: "14px 20px",
      marginBottom: 22,
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22
    }
  }, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: C.green
    }
  }, "Deposit request submitted!"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#065f46",
      marginTop: 2
    }
  }, "Pending admin approval \u2014 you'll be notified once it's confirmed.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSuccessBanner(false),
    style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 20,
      color: C.green
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 14,
      marginBottom: 22
    }
  }, [[C.primary, "◈", "Current Balance", `$${balance.toFixed(2)}`], [C.yellow, "⏱", "Pending Balance", "$320.00"], [C.green, "↓", "Total Deposits", "$5,850.00"], [C.blue, "↑", "Total Spent", "$4,610.00"]].map(([col, ic, l, v]) => /*#__PURE__*/React.createElement(Card, {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      background: col + "20",
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      marginBottom: 10
    }
  }, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: col,
      margin: "4px 0"
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 280px",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 4px",
      fontSize: 16,
      fontWeight: 900,
      color: C.g800
    }
  }, "Top Up Balance"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 24px",
      fontSize: 13,
      color: C.g500
    }
  }, "Add funds to your account balance."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      marginBottom: 28
    }
  }, [{
    n: 1,
    l: "Payment Method"
  }, {
    n: 2,
    l: "Payment Details"
  }, {
    n: 3,
    l: "Upload Proof"
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    style: {
      display: "flex",
      alignItems: "center",
      flex: i < 2 ? 1 : "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: payStep >= s.n ? C.primary : C.g200,
      color: payStep >= s.n ? "#fff" : C.g400,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 13
    }
  }, payStep > s.n ? "✓" : s.n), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: payStep === s.n ? C.primary : C.g400,
      fontWeight: payStep === s.n ? 700 : 400,
      whiteSpace: "nowrap"
    }
  }, s.l)), i < 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 2,
      background: payStep > s.n ? C.primary : C.g200,
      margin: "0 6px",
      marginBottom: 18
    }
  })))), payStep === 1 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 22
    }
  }, Object.keys(PAYMENT_INFO).map(m => /*#__PURE__*/React.createElement("div", {
    key: m,
    onClick: () => setMethod(m),
    style: {
      border: `2px solid ${method === m ? C.primary : C.g200}`,
      borderRadius: 11,
      padding: "11px 16px",
      cursor: "pointer",
      background: method === m ? C.primaryLight : "#fff",
      display: "flex",
      alignItems: "center",
      gap: 8,
      transition: "all .15s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\uD83D\uDCB3"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: method === m ? C.primary : C.g600
    }
  }, m)))), /*#__PURE__*/React.createElement(Btn, {
    onClick: () => setPayStep(2)
  }, "Next Step \u2192")), payStep === 2 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      borderRadius: 11,
      padding: "13px 16px",
      marginBottom: 18,
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\u2139\uFE0F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13
    }
  }, "Send to: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: C.primary
    }
  }, PAYMENT_INFO[method])), /*#__PURE__*/React.createElement("button", {
    onClick: () => navigator.clipboard?.writeText(PAYMENT_INFO[method]),
    style: {
      marginLeft: "auto",
      background: C.g100,
      border: "none",
      borderRadius: 6,
      padding: "4px 10px",
      fontSize: 11,
      cursor: "pointer"
    }
  }, "Copy")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 14,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 12,
      color: C.g500,
      marginBottom: 6,
      fontWeight: 600
    }
  }, "Your Account"), /*#__PURE__*/React.createElement("input", {
    placeholder: "Email / Wallet / ID",
    style: {
      width: "100%",
      border: `1.5px solid ${C.g200}`,
      borderRadius: 9,
      padding: "10px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none",
      boxSizing: "border-box"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 12,
      color: C.g500,
      marginBottom: 6,
      fontWeight: 600
    }
  }, "Amount (USD)"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: amount,
    onChange: e => setAmount(e.target.value),
    style: {
      width: "100%",
      border: `1.5px solid ${C.g200}`,
      borderRadius: 9,
      padding: "10px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none",
      boxSizing: "border-box"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginTop: 4
    }
  }, "Minimum: $10")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 12,
      color: C.g500,
      marginBottom: 6,
      fontWeight: 600
    }
  }, "You receive"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      color: C.primary,
      paddingTop: 6
    }
  }, "$", parseFloat(amount || 0).toFixed(2)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    onClick: () => setPayStep(1)
  }, "\u2190 Back"), /*#__PURE__*/React.createElement(Btn, {
    onClick: () => setPayStep(3)
  }, "Next Step \u2192"))), payStep === 3 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.yellowL,
      border: `1px solid ${C.yellow}40`,
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 18,
      fontSize: 13,
      color: "#92400e"
    }
  }, "\u26A0\uFE0F Send ", /*#__PURE__*/React.createElement("strong", null, "$", parseFloat(amount || 0).toFixed(2), " USD"), " via ", /*#__PURE__*/React.createElement("strong", null, method), " to ", /*#__PURE__*/React.createElement("strong", null, PAYMENT_INFO[method]), ", then upload your payment screenshot below."), /*#__PURE__*/React.createElement("div", {
    onClick: () => setProof(p => !p),
    style: {
      border: `2px dashed ${proof ? C.green : C.g300}`,
      borderRadius: 13,
      padding: "38px",
      textAlign: "center",
      cursor: "pointer",
      background: proof ? C.greenL : C.g50,
      marginBottom: 18,
      transition: "all .2s"
    }
  }, proof ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 8
    }
  }, "\u2705"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: C.green
    }
  }, "proof_payment.png uploaded"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#065f46"
    }
  }, "Click to replace")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 8,
      color: C.g400
    }
  }, "\u2191"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: C.g500
    }
  }, "Click to Upload Payment Proof"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginTop: 4
    }
  }, "PNG, JPG, PDF up to 5MB"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    onClick: () => setPayStep(2)
  }, "\u2190 Back"), /*#__PURE__*/React.createElement(Btn, {
    onClick: submitDeposit,
    style: {
      background: proof ? C.primary : C.g300,
      cursor: proof ? "pointer" : "default"
    }
  }, "Submit Deposit Request")))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 900,
      color: C.g800
    }
  }, "Transaction History"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 7
    }
  }, [["all", "All"], ["deposit", "Deposits"], ["spent", "Spent"], ["refund", "Refunds"]].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setTxFilter(v),
    style: {
      padding: "6px 14px",
      borderRadius: 8,
      border: `1px solid ${txFilter === v ? C.primary : C.g200}`,
      background: txFilter === v ? C.primaryLight : "#fff",
      color: txFilter === v ? C.primary : C.g500,
      fontSize: 12,
      fontWeight: txFilter === v ? 700 : 400,
      cursor: "pointer"
    }
  }, l)))), /*#__PURE__*/React.createElement(DataTable, {
    cols: txCols,
    rows: filtered,
    emptyMsg: "No transactions found."
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 14px",
      fontSize: 14,
      fontWeight: 900,
      color: C.g800
    }
  }, "Payment Methods"), Object.entries(PAYMENT_INFO).map(([m, v]) => /*#__PURE__*/React.createElement("div", {
    key: m,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 0",
      borderBottom: `1px solid ${C.g100}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      background: C.primaryLight,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 15,
      flexShrink: 0
    }
  }, "\uD83D\uDCB3"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12,
      color: C.g700
    }
  }, m), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400
    }
  }, v)), /*#__PURE__*/React.createElement("button", {
    onClick: () => navigator.clipboard?.writeText(v),
    style: {
      background: C.g100,
      border: "none",
      borderRadius: 6,
      padding: "3px 9px",
      fontSize: 11,
      cursor: "pointer",
      color: C.g500
    }
  }, "Copy")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.yellowL,
      border: `1px solid ${C.yellow}30`,
      borderRadius: 13,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 13,
      color: "#92400e",
      marginBottom: 3
    }
  }, "Important"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#78350f",
      lineHeight: 1.5
    }
  }, "Please send the exact amount. Wrong amounts may cause processing delays.")))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 12px",
      fontSize: 14,
      fontWeight: 900,
      color: C.g800
    }
  }, "Balance Summary"), [["Total Deposits", "$5,850.00", C.green], ["Total Spent", "$4,610.00", C.red], ["Pending", "$320.00", C.yellow], ["Net Balance", `$${balance.toFixed(2)}`, C.primary]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "9px 0",
      borderBottom: `1px solid ${C.g100}`,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g500
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      color: c
    }
  }, v)))))));
}

/* ===== PreVerifiedPage.jsx ===== */

const ACCOUNTS = [{
  platform: "Meta",
  type: "Aged",
  id: "META-64258",
  age: "6+ Months",
  spend: "$250/day",
  status: "BM Verified",
  price: 120
}, {
  platform: "Google",
  type: "Aged",
  id: "GOOGLE-19532",
  age: "8+ Months",
  spend: "$200/day",
  status: "Active",
  price: 110
}, {
  platform: "TikTok",
  type: "New",
  id: "TIKTOK-78412",
  age: "1+ Months",
  spend: "$150/day",
  status: "Active",
  price: 95
}, {
  platform: "Snapchat",
  type: "Aged",
  id: "SNAP-32541",
  age: "5+ Months",
  spend: "$100/day",
  status: "Active",
  price: 90
}, {
  platform: "Meta",
  type: "Aged",
  id: "META-64211",
  age: "7+ Months",
  spend: "$300/day",
  status: "BM Verified",
  price: 150
}, {
  platform: "Google",
  type: "New",
  id: "GOOGLE-19876",
  age: "2+ Months",
  spend: "$120/day",
  status: "Active",
  price: 85
}, {
  platform: "TikTok",
  type: "Aged",
  id: "TIKTOK-78493",
  age: "4+ Months",
  spend: "$180/day",
  status: "Active",
  price: 105
}, {
  platform: "Snapchat",
  type: "New",
  id: "SNAP-32588",
  age: "1+ Months",
  spend: "$80/day",
  status: "Active",
  price: 75
}];

/* ═══════════════════════════════════════════════════
   PRE-VERIFIED ACCOUNTS PAGE
═══════════════════════════════════════════════════ */
function PreVerifiedPage() {
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Pre-Verified Accounts",
    subtitle: "Browse and purchase ready-to-use, pre-verified ad accounts.",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "how",
      variant: "outline"
    }, "? How it works?"), /*#__PURE__*/React.createElement(Btn, {
      key: "purchases"
    }, "\u25C8 My Purchases")]
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 20,
      padding: "14px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      flexWrap: "wrap",
      alignItems: "flex-end"
    }
  }, [["Platform", ["All Platforms", "Meta", "Google", "TikTok", "Snapchat"]], ["Account Type", ["All Types", "Aged", "Fresh"]], ["Account Age", ["All Ages", "1+ Months", "3+ Months", "6+ Months", "12+ Months"]]].map(([l, o]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 5,
      fontWeight: 600
    }
  }, l), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }, o.map(opt => /*#__PURE__*/React.createElement("option", {
    key: opt
  }, opt))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 5,
      fontWeight: 600
    }
  }, "Price Range"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "$ Min",
    style: {
      width: 72,
      border: `1px solid ${C.g200}`,
      borderRadius: 8,
      padding: "9px 10px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g300
    }
  }, "\u2014"), /*#__PURE__*/React.createElement("input", {
    placeholder: "$ Max",
    style: {
      width: 72,
      border: `1px solid ${C.g200}`,
      borderRadius: 8,
      padding: "9px 10px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 5,
      fontWeight: 600
    }
  }, "Sort By"), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }, ["Newest First", "Price: Low to High", "Price: High to Low", "Most Popular"].map(o => /*#__PURE__*/React.createElement("option", {
    key: o
  }, o)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 16
    }
  }, ACCOUNTS.map(acc => /*#__PURE__*/React.createElement(Card, {
    key: acc.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: acc.platform,
    size: 26
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      background: acc.type === "Aged" ? C.greenL : C.blueL,
      color: acc.type === "Aged" ? C.green : C.blue,
      fontSize: 11,
      fontWeight: 800,
      padding: "3px 9px",
      borderRadius: 20
    }
  }, acc.type)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 900,
      fontSize: 15,
      color: C.g800,
      marginBottom: 3
    }
  }, acc.platform, " Ads Account"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginBottom: 14
    }
  }, "ID: ", acc.id), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      marginBottom: 16
    }
  }, [`Account Age: ${acc.age}`, `Spending Limit: ${acc.spend}`, `Status: ${acc.status}`].map(f => /*#__PURE__*/React.createElement("div", {
    key: f,
    style: {
      fontSize: 12,
      color: C.g500,
      display: "flex",
      alignItems: "center",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.green,
      fontWeight: 800
    }
  }, "\u2713"), f))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 900,
      color: C.primary
    }
  }, "$", acc.price, ".00"), /*#__PURE__*/React.createElement(Btn, {
    size: "sm"
  }, "\uD83D\uDED2 Buy Now"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 8,
      marginTop: 24
    }
  }, ["‹", 1, 2, 3, "...", 12, "›"].map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    style: {
      width: 36,
      height: 36,
      borderRadius: 8,
      border: `1px solid ${p === 1 ? C.primary : C.g200}`,
      background: p === 1 ? C.primary : "#fff",
      color: p === 1 ? "#fff" : C.g500,
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer"
    }
  }, p))));
}

/* ===== MediaBuyersPage.jsx ===== */

/* ═══════════════════════════════════════════════════
   MEDIA BUYERS PAGE  (User-facing)
   Only shows approved buyers from the admin panel.
═══════════════════════════════════════════════════ */
function MediaBuyersPage({
  mediaBuyers
}) {
  const approved = (mediaBuyers || []).filter(m => m.status === "approved");
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Media Buyers",
    subtitle: "Hire expert media buyers to scale your advertising campaigns.",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "how",
      variant: "outline"
    }, "? How it works?"), /*#__PURE__*/React.createElement(Btn, {
      key: "job"
    }, "+ Post a Job")]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 260px",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 18,
      padding: "14px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap"
    }
  }, [["Platform", ["All Platforms", "Meta", "Google", "TikTok", "Snapchat"]], ["Expertise", ["All Expertise", "Performance", "Brand", "E-commerce"]], ["Pricing", ["All Pricing", "Monthly", "Project"]]].map(([l, o]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginBottom: 4,
      fontWeight: 600
    }
  }, l), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }, o.map(opt => /*#__PURE__*/React.createElement("option", {
    key: opt
  }, opt))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      alignSelf: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "\uD83D\uDD0D Search buyers\u2026",
    style: {
      width: 200,
      border: `1px solid ${C.g200}`,
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.g400,
      marginBottom: 14
    }
  }, "Showing ", approved.length, " media buyer", approved.length !== 1 ? "s" : "", " available"), approved.length === 0 ? /*#__PURE__*/React.createElement(Card, {
    style: {
      textAlign: "center",
      padding: "64px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 52,
      marginBottom: 16
    }
  }, "\uD83D\uDC64"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: C.g700,
      margin: "0 0 8px"
    }
  }, "No Media Buyers Available Yet"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: C.g400,
      margin: "0 0 20px"
    }
  }, "We're reviewing applications. Check back soon!"), /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    onClick: () => {}
  }, "Apply as a Media Buyer")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 14
    }
  }, approved.map(mb => /*#__PURE__*/React.createElement(Card, {
    key: mb.id
  }, mb.orders > 100 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      padding: "3px 9px",
      borderRadius: 20,
      background: C.yellowL,
      color: "#d97706",
      display: "inline-block",
      marginBottom: 10
    }
  }, "\u2B50 Top Rated"), mb.orders > 50 && mb.orders <= 100 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      padding: "3px 9px",
      borderRadius: 20,
      background: C.blueL,
      color: C.blue,
      display: "inline-block",
      marginBottom: 10
    }
  }, "Pro Seller"), !mb.orders && mb.orders === 0 && mb.status === "approved" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 800,
      padding: "3px 9px",
      borderRadius: 20,
      background: C.greenL,
      color: C.green,
      display: "inline-block",
      marginBottom: 10
    }
  }, "New"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 50,
      height: 50,
      borderRadius: "50%",
      background: `linear-gradient(135deg,${C.primary},#ff6b7a)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 800,
      fontSize: 16,
      marginBottom: 10
    }
  }, mb.avatar), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 900,
      fontSize: 14,
      color: C.g800
    }
  }, mb.name, " \u2713"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g500,
      marginBottom: 8
    }
  }, mb.speciality), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      marginBottom: 8
    }
  }, mb.platforms.map(p => /*#__PURE__*/React.createElement(PlatformIcon, {
    key: p,
    name: p,
    size: 15
  }))), mb.rating > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.yellow
    }
  }, "★".repeat(Math.floor(mb.rating)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g400
    }
  }, " ", mb.rating, " (", mb.reviews, " reviews)")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      margin: "5px 0 14px"
    }
  }, mb.spent, " managed ", mb.orders > 0 ? `· ${mb.orders} orders` : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 16,
      color: C.primary
    }
  }, "$", mb.rate, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.g400,
      fontWeight: 400
    }
  }, "/mo")), /*#__PURE__*/React.createElement(Btn, {
    size: "sm"
  }, "Hire Now")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontSize: 14,
      fontWeight: 800,
      color: C.g800
    }
  }, "Why Hire a Media Buyer?"), [["📊", "Expert campaign management", "Maximize ROI with proven strategies"], ["⏱", "Save time & effort", "We handle ads while you focus on business"], ["🚀", "Scale faster", "Experienced buyers achieve better results"], ["🛡", "Risk-free", "Pay monthly, cancel anytime"]].map(([ic, t, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      background: C.primaryLight,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 15,
      flexShrink: 0
    }
  }, ic), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 12,
      color: C.g700
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginTop: 2
    }
  }, s))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 14px",
      fontSize: 14,
      fontWeight: 800,
      color: C.g800
    }
  }, "How It Works"), [["Browse & choose", "Explore buyers and check their reviews"], ["Hire & discuss", "Share your campaign goals and budget"], ["Launch & grow", "They manage your ads and drive results"]].map(([t, s], i) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 26,
      height: 26,
      background: C.primary,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 12,
      fontWeight: 800,
      flexShrink: 0
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: C.g600
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginTop: 2
    }
  }, s))))), /*#__PURE__*/React.createElement(Card, {
    style: {
      background: `linear-gradient(135deg,${C.primaryLight},#fff)`,
      border: `1px solid ${C.primary}25`
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 8px",
      fontSize: 13,
      fontWeight: 800,
      color: C.primary
    }
  }, "Become a Media Buyer"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: C.g500,
      margin: "0 0 14px",
      lineHeight: 1.5
    }
  }, "Join our marketplace and grow your media buying business with a global client base."), /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    full: true,
    size: "sm"
  }, "Apply Now \u2192")))));
}

/* ===== ProjectsAndSupport.jsx ===== */

/* ═══════════════════════════════════════════════════
   PROJECTS PAGE
═══════════════════════════════════════════════════ */
function ProjectsPage() {
  const [tab, setTab] = useState("updates");
  const updates = [{
    date: "May 31",
    time: "10:30 AM",
    title: "Optimization Phase",
    msg: "We paused low performing ad sets and scaled the winners. CPA decreased by 20% compared to last week.",
    prog: 75,
    file: "performance_report.png",
    size: "125 KB"
  }, {
    date: "May 29",
    time: "04:15 PM",
    title: "Campaign Launched",
    msg: "We launched 3 campaigns targeting US audience. CTR looks promising, testing creatives now.",
    prog: 60,
    file: "campaign_screenshot.png",
    size: "210 KB"
  }, {
    date: "May 25",
    time: "11:20 AM",
    title: "Initial Setup Completed",
    msg: "Pixel installed, audiences created and first ad sets are ready. Will launch after your approval.",
    prog: 30,
    file: "setup_details.pdf",
    size: "320 KB"
  }];
  const files = [["📄", "campaign_brief.pdf", "May 20, 2024", "2.1 MB"], ["📊", "audience_research.xlsx", "May 22, 2024", "18 KB"], ["🗜", "ad_creatives.zip", "May 25, 2024", "5.4 MB"], ["📄", "weekly_report_may31.pdf", "May 31, 2024", "1.8 MB"]];
  return /*#__PURE__*/React.createElement(PageShell, {
    breadcrumb: "Dashboard \u203A Projects",
    title: "Projects"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.g400,
      cursor: "pointer",
      marginBottom: 16
    }
  }, "\u2190 Back to My Projects"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 270px",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      alignItems: "flex-start",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 54,
      height: 54,
      background: "#1877f210",
      borderRadius: 13,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: "Meta",
    size: 28
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 19,
      fontWeight: 900,
      color: C.g800
    }
  }, "Meta Ads Campaign"), /*#__PURE__*/React.createElement(Badge, {
    status: "active"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.g400
    }
  }, "Project ID: #1023 \xB7 Hired: May 20, 2024 \xB7 Buyer: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary,
      fontWeight: 700
    }
  }, "Alex Smith"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 4
    }
  }, "Overall Progress"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      fontWeight: 900,
      color: C.g800
    }
  }, "70%"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 160,
      height: 8,
      background: C.g200,
      borderRadius: 4,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "70%",
      height: "100%",
      background: C.primary,
      borderRadius: 4
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderBottom: `1px solid ${C.g200}`
    }
  }, ["Overview", "Updates", "Files", "Messages"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t.toLowerCase()),
    style: {
      padding: "11px 22px",
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: tab === t.toLowerCase() ? 800 : 400,
      color: tab === t.toLowerCase() ? C.primary : C.g400,
      borderBottom: tab === t.toLowerCase() ? `2px solid ${C.primary}` : "2px solid transparent",
      fontFamily: "inherit",
      marginBottom: -1
    }
  }, t)))), /*#__PURE__*/React.createElement(Card, null, tab === "overview" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontSize: 15,
      fontWeight: 800
    }
  }, "Project Overview"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, [["Platform", "Meta Ads"], ["Campaign Type", "Traffic"], ["Daily Budget", "$50.00"], ["Total Budget", "$1,000.00"], ["Target Country", "United States"], ["Start Date", "May 20, 2024"], ["Est. Duration", "30 Days"], ["Status", "Active"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      background: C.g50,
      borderRadius: 10,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginBottom: 3
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: C.g800
    }
  }, v))))), tab === "updates" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 3px",
      fontSize: 15,
      fontWeight: 800,
      color: C.g800
    }
  }, "Project Updates"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      color: C.g400
    }
  }, "Updates shared by your media buyer.")), /*#__PURE__*/React.createElement(Btn, {
    size: "sm"
  }, "+ Add Update")), updates.map((u, i) => /*#__PURE__*/React.createElement("div", {
    key: u.title,
    style: {
      display: "flex",
      gap: 16,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: i === 0 ? C.primary : C.g100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16
    }
  }, "\uD83D\uDE80"), i < updates.length - 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 2,
      flex: 1,
      background: C.g200,
      minHeight: 28
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginBottom: 7
    }
  }, u.date, ", 2024 \xB7 ", u.time), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      borderRadius: 13,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: C.g800
    }
  }, u.title), /*#__PURE__*/React.createElement("span", {
    style: {
      background: C.primaryLight,
      color: C.primary,
      fontSize: 11,
      fontWeight: 800,
      padding: "3px 10px",
      borderRadius: 20
    }
  }, "Progress: ", u.prog, "%")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.g500,
      margin: "0 0 12px"
    }
  }, u.msg), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#fff",
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 13px"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\uD83D\uDCCE"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      flex: 1
    }
  }, u.file), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.g400
    }
  }, u.size), /*#__PURE__*/React.createElement("span", {
    style: {
      cursor: "pointer"
    }
  }, "\u2B07"))))))), tab === "files" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontSize: 15,
      fontWeight: 800
    }
  }, "Files & Documents"), files.map(([ic, n, d, s]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      borderBottom: `1px solid ${C.g100}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24
    }
  }, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400
    }
  }, d, " \xB7 ", s)), /*#__PURE__*/React.createElement(Btn, {
    size: "sm",
    variant: "outline"
  }, "\u2B07 Download")))), tab === "messages" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontSize: 15,
      fontWeight: 800
    }
  }, "Messages"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      borderRadius: 11,
      padding: 14,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginBottom: 5
    }
  }, "Alex Smith \xB7 May 31"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: C.g600
    }
  }, "Hi! I've uploaded the performance report. CPA is down 20% this week \u2014 great results!")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.primaryLight,
      borderRadius: 11,
      padding: 14,
      marginBottom: 16,
      marginLeft: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginBottom: 5
    }
  }, "You \xB7 May 31"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      color: C.g600
    }
  }, "Great work! Can we increase the budget for the best-performing campaign?")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Type a message\u2026",
    style: {
      flex: 1,
      border: `1.5px solid ${C.g200}`,
      borderRadius: 9,
      padding: "11px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement(Btn, null, "Send"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 14px",
      fontSize: 14,
      fontWeight: 800
    }
  }, "Project Details"), [["Platform", "Meta Ads"], ["Daily Budget", "$50.00"], ["Total Budget", "$1,000.00"], ["Target Country", "United States"], ["Start Date", "May 20, 2024"], ["Duration", "30 Days"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: `1px solid ${C.g100}`,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g400
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: C.g700
    }
  }, v)))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 800
    }
  }, "Files"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary,
      fontSize: 12,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "View All")), files.slice(0, 3).map(([ic, n, _, s]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 0",
      borderBottom: `1px solid ${C.g100}`
    }
  }, /*#__PURE__*/React.createElement("span", null, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: C.g600
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400
    }
  }, s)), /*#__PURE__*/React.createElement("span", {
    style: {
      cursor: "pointer"
    }
  }, "\u2B07")))))));
}

/* ═══════════════════════════════════════════════════
   SUPPORT PAGE
═══════════════════════════════════════════════════ */
function SupportPage() {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const submit = () => {
    if (subject && msg) setSent(true);
  };
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Support",
    subtitle: "Get help from our 24/7 support team."
  }, sent && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.greenL,
      border: `1px solid ${C.green}40`,
      borderRadius: 12,
      padding: "14px 18px",
      marginBottom: 22,
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2705"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: C.green
    }
  }, "Ticket submitted!"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#065f46"
    }
  }, "We'll respond within 24 hours.")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSent(false),
    style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 18,
      color: C.green
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 16,
      marginBottom: 24
    }
  }, [["💬", C.blue, "Live Chat", "Chat with our team in real-time", "Start Chat"], ["📧", C.green, "Email Support", "We respond within 24 hours", "Send Email"], ["📞", C.purple, "Phone Support", "Call us during business hours", "Call Now"]].map(([ic, c, t, s, btn]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    style: {
      textAlign: "center",
      padding: "28px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 12
    }
  }, ic), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 8px",
      fontSize: 15,
      fontWeight: 800,
      color: C.g800
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: C.g400,
      margin: "0 0 16px"
    }
  }, s), /*#__PURE__*/React.createElement("button", {
    style: {
      background: c,
      color: "#fff",
      border: "none",
      borderRadius: 9,
      padding: "9px 22px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit"
    }
  }, btn)))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 22px",
      fontSize: 16,
      fontWeight: 800,
      color: C.g800
    }
  }, "Submit a Support Ticket"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 13,
      color: C.g600,
      marginBottom: 7,
      fontWeight: 600
    }
  }, "Subject ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary
    }
  }, "*")), /*#__PURE__*/React.createElement("input", {
    value: subject,
    onChange: e => setSubject(e.target.value),
    placeholder: "Brief subject of your issue",
    style: {
      width: "100%",
      border: `1.5px solid ${C.g200}`,
      borderRadius: 10,
      padding: "11px 14px",
      fontSize: 14,
      fontFamily: "inherit",
      outline: "none",
      boxSizing: "border-box"
    },
    onFocus: e => e.target.style.borderColor = C.primary,
    onBlur: e => e.target.style.borderColor = C.g200
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 13,
      color: C.g600,
      marginBottom: 7,
      fontWeight: 600
    }
  }, "Category ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary
    }
  }, "*")), /*#__PURE__*/React.createElement("select", {
    style: {
      width: "100%",
      background: "#fff",
      border: `1.5px solid ${C.g200}`,
      borderRadius: 10,
      padding: "11px 14px",
      fontSize: 14,
      fontFamily: "inherit",
      outline: "none"
    }
  }, ["General Inquiry", "Billing Issue", "Technical Problem", "Account Issue", "Ad Account Problem"].map(o => /*#__PURE__*/React.createElement("option", {
    key: o
  }, o))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 13,
      color: C.g600,
      marginBottom: 7,
      fontWeight: 600
    }
  }, "Message ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary
    }
  }, "*")), /*#__PURE__*/React.createElement("textarea", {
    rows: 5,
    value: msg,
    onChange: e => setMsg(e.target.value),
    placeholder: "Describe your issue in detail\u2026",
    style: {
      width: "100%",
      border: `1.5px solid ${C.g200}`,
      borderRadius: 10,
      padding: "11px 14px",
      fontSize: 14,
      resize: "vertical",
      boxSizing: "border-box",
      fontFamily: "inherit",
      outline: "none"
    },
    onFocus: e => e.target.style.borderColor = C.primary,
    onBlur: e => e.target.style.borderColor = C.g200
  })), /*#__PURE__*/React.createElement(Btn, {
    onClick: submit,
    style: {
      opacity: subject && msg ? 1 : .5
    }
  }, "Submit Ticket")));
}

/* ===== AdminDashboard.jsx ===== */

/* ═══════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════ */
function AdminDashboard({
  mediaBuyers,
  setPage
}) {
  const pendingBuyers = (mediaBuyers || []).filter(m => m.status === "pending").length;
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Dashboard",
    subtitle: "Welcome back, Super Admin! Here's what's happening on your platform."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 280px",
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 14,
      marginBottom: 16
    }
  }, [["👥", "Total Users", "1,248", C.blue], ["◧", "Ad Accounts", "2,346", C.green], ["✓", "Verified Accounts", "4,562", C.primary], ["👤", "Media Buyers", "312", C.purple]].map(([ic, l, v, c]) => /*#__PURE__*/React.createElement(Card, {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      background: c + "20",
      borderRadius: 9,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      marginBottom: 10
    }
  }, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: C.g800,
      margin: "4px 0"
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.green
    }
  }, "\u2191 18.5% from last week")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 14,
      marginBottom: 20
    }
  }, [["◈", "Total Balance", "$125,430.50", C.primary], ["↓", "Total Deposits", "$86,245.30", C.blue], ["🛒", "Total Orders", "3,987", C.green], ["💬", "Open Tickets", "128", C.yellow]].map(([ic, l, v, c]) => /*#__PURE__*/React.createElement(Card, {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      background: c + "20",
      borderRadius: 9,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 16,
      marginBottom: 10
    }
  }, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      color: C.g800,
      margin: "4px 0"
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.green
    }
  }, "\u2191 20.4% from last week")))), pendingBuyers > 0 && /*#__PURE__*/React.createElement("div", {
    onClick: () => setPage("admin-media-buyers"),
    style: {
      background: C.yellowL,
      border: `2px solid ${C.yellow}50`,
      borderRadius: 13,
      padding: "16px 20px",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 14,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      background: C.yellow + "30",
      borderRadius: 11,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 22,
      flexShrink: 0
    }
  }, "\u23F3"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: "#92400e"
    }
  }, pendingBuyers, " Media Buyer Application", pendingBuyers > 1 ? "s" : "", " Pending Review"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#a16207",
      marginTop: 2
    }
  }, "Review and approve or reject media buyer applications to make them visible on the platform.")), /*#__PURE__*/React.createElement(Btn, {
    variant: "warning",
    size: "sm"
  }, "Review Now \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 800
    }
  }, "Overview Chart"), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 7,
      padding: "3px 8px",
      fontSize: 12,
      fontFamily: "inherit",
      outline: "none"
    }
  }, /*#__PURE__*/React.createElement("option", null, "This Week"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 130,
      display: "flex",
      alignItems: "flex-end",
      gap: 5
    }
  }, [60, 80, 55, 90, 75, 85, 100].map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: h * 1.2,
      background: `${C.primary}18`,
      borderRadius: "4px 4px 0 0",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "55%",
      background: C.primary + "70",
      borderRadius: "4px 4px 0 0",
      position: "absolute",
      bottom: 0
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: C.g300
    }
  }, "May ", 19 + i))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 14px",
      fontSize: 14,
      fontWeight: 800
    }
  }, "Accounts by Platform"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 90,
      height: 90,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 100",
    style: {
      transform: "rotate(-90deg)",
      width: 90,
      height: 90
    }
  }, [{
    p: 53.1,
    c: C.primary
  }, {
    p: 23.9,
    c: C.green
  }, {
    p: 15.2,
    c: C.blue
  }, {
    p: 7.8,
    c: C.yellow
  }].reduce((acc, seg) => {
    const dash = seg.p / 100 * 251.2;
    acc.els.push(/*#__PURE__*/React.createElement("circle", {
      key: seg.c,
      cx: "50",
      cy: "50",
      r: "40",
      fill: "none",
      stroke: seg.c,
      strokeWidth: "18",
      strokeDasharray: `${dash} ${251.2 - dash}`,
      strokeDashoffset: -acc.offset * 2.512
    }));
    acc.offset += seg.p;
    return acc;
  }, {
    els: [],
    offset: 0
  }).els), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 900
    }
  }, "2,346"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, [["Meta", "1,245", "53.1%", C.primary], ["Google", "562", "23.9%", C.green], ["TikTok", "356", "15.2%", C.blue], ["Snapchat", "183", "7.8%", C.yellow]].map(([p, n, pct, c]) => /*#__PURE__*/React.createElement("div", {
    key: p,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      background: c,
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.g500,
      flex: 1
    }
  }, p), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.g300
    }
  }, "(", pct, ")"))))))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 800
    }
  }, "Latest Orders"), /*#__PURE__*/React.createElement(Btn, {
    variant: "ghost",
    size: "sm",
    onClick: () => setPage("admin-orders")
  }, "View All \u2192")), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: `1px solid ${C.g200}`,
      background: C.g50
    }
  }, ["Order ID", "User", "Type", "Platform", "Amount", "Status", "Date"].map(h => /*#__PURE__*/React.createElement("th", {
    key: h,
    style: {
      padding: "9px 10px",
      textAlign: "left",
      color: C.g400,
      fontWeight: 700,
      fontSize: 12
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, [["ORD-98765", "john.doe@example.com", "Ad Account", "Meta", 120, "completed"], ["ORD-98764", "william@example.com", "Pre-Verified", "Google", 150, "completed"], ["ORD-98763", "emma@example.com", "Ad Account", "TikTok", 100, "processing"], ["ORD-98762", "olivia@example.com", "Ad Account", "Snapchat", 90, "pending"]].map(([id, u, t, p, a, s]) => /*#__PURE__*/React.createElement("tr", {
    key: id,
    style: {
      borderBottom: `1px solid ${C.g100}`
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px",
      fontWeight: 700,
      color: C.g700,
      fontSize: 12
    }
  }, id), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px",
      color: C.g500,
      fontSize: 12
    }
  }, u), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px",
      color: C.g500,
      fontSize: 12
    }
  }, t), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement(PlatformIcon, {
    name: p,
    size: 14
  }), p)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px",
      fontWeight: 700
    }
  }, "$", a, ".00"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    status: s
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px",
      color: C.g400,
      fontSize: 12
    }
  }, "May 25, 2024"))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 14px",
      fontSize: 14,
      fontWeight: 800
    }
  }, "Platform Overview"), [["Active Users", 892, C.green], ["Inactive Users", 356, C.g300], ["Banned Users", 45, C.red], ["Pending Users", 78, C.yellow]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: c
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.g500,
      flex: 1
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700
    }
  }, v)))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 800
    }
  }, "Recent Activity"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary,
      fontSize: 12,
      cursor: "pointer",
      fontWeight: 700
    }
  }, "View All")), [["👤", "New user registered", "2 min ago"], ["💰", "New deposit $500.00", "8 min ago"], ["◧", "Ad account submitted", "15 min ago"], ["✓", "Verified account purchased", "22 min ago"]].map(([ic, t, d]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      gap: 10,
      padding: "8px 0",
      borderBottom: `1px solid ${C.g100}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      background: C.primaryLight,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      flexShrink: 0
    }
  }, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: C.g700
    }
  }, t)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g300,
      whiteSpace: "nowrap"
    }
  }, d)))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 12px",
      fontSize: 14,
      fontWeight: 800
    }
  }, "System Info"), [["Version", "v2.4.1"], ["DB Status", "● Connected"], ["Storage", "68% (136.5 GB)"], ["Backup", "● Up to date"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: `1px solid ${C.g100}`,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g400
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.g700,
      fontWeight: 700
    }
  }, v)))), /*#__PURE__*/React.createElement(Card, {
    style: {
      background: C.primaryLight,
      border: `1px solid ${C.primary}20`
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 12px",
      fontSize: 13,
      fontWeight: 800,
      color: C.g700
    }
  }, "Quick Actions"), [["+ Add New User", "admin-users"], ["+ Add Balance", "admin-deposits"], ["📢 Create Announcement", "admin-settings"], ["📋 View All Orders", "admin-orders"]].map(([l, pg]) => /*#__PURE__*/React.createElement("button", {
    key: l,
    onClick: () => setPage(pg),
    style: {
      width: "100%",
      background: "#fff",
      border: `1px solid ${C.g200}`,
      borderRadius: 8,
      padding: "9px 12px",
      fontSize: 12,
      cursor: "pointer",
      color: C.g700,
      textAlign: "left",
      marginBottom: 7,
      fontWeight: 700,
      fontFamily: "inherit"
    }
  }, l))))));
}

/* ===== AdminMediaBuyersPage.jsx ===== */

/* ═══════════════════════════════════════════════════
   ADMIN MEDIA BUYERS  — Applications & Management
═══════════════════════════════════════════════════ */

/* Application detail modal */
function ApplicationModal({
  buyer,
  onApprove,
  onReject,
  onClose
}) {
  const [rejectForm, setRejectForm] = useState(false);
  const [rejectReason, setReason] = useState("");
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Application Details",
    onClose: onClose,
    width: 560
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      alignItems: "flex-start",
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: buyer.avatar,
    size: 60
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 18,
      fontWeight: 900,
      color: C.g800
    }
  }, buyer.name), /*#__PURE__*/React.createElement(Badge, {
    status: buyer.status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: C.g500,
      marginBottom: 8
    }
  }, buyer.speciality), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, buyer.platforms.map(p => /*#__PURE__*/React.createElement(PlatformIcon, {
    key: p,
    name: p,
    size: 18
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 22
    }
  }, [["Email", buyer.email], ["Experience", buyer.experience], ["Total Managed", buyer.spent], ["Monthly Rate", `$${buyer.rate}/month`], ["Applied", buyer.joined], ["Portfolio", buyer.portfolio]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      background: C.g50,
      borderRadius: 10,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginBottom: 3,
      textTransform: "uppercase",
      letterSpacing: .6,
      fontWeight: 700
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.g700,
      wordBreak: "break-all"
    }
  }, v)))), buyer.rejectReason && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.redL,
      border: `1px solid ${C.red}30`,
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      color: C.red,
      fontSize: 13,
      marginBottom: 4
    }
  }, "Rejection Reason"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.red
    }
  }, buyer.rejectReason)), rejectForm && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontSize: 13,
      fontWeight: 700,
      color: C.g700,
      marginBottom: 8
    }
  }, "Rejection Reason ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary
    }
  }, "*")), /*#__PURE__*/React.createElement("textarea", {
    value: rejectReason,
    onChange: e => setReason(e.target.value),
    rows: 3,
    placeholder: "Explain why this application is being rejected\u2026",
    style: {
      width: "100%",
      border: `1.5px solid ${C.red}60`,
      borderRadius: 9,
      padding: "10px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none",
      boxSizing: "border-box",
      resize: "vertical"
    }
  })), buyer.status === "pending" && !rejectForm && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    onClick: onClose,
    style: {
      flex: 1
    }
  }, "Cancel"), /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    onClick: () => setRejectForm(true),
    style: {
      flex: 1
    }
  }, "\u2715 Reject"), /*#__PURE__*/React.createElement(Btn, {
    variant: "success",
    onClick: () => onApprove(buyer.id),
    style: {
      flex: 1
    }
  }, "\u2713 Approve")), buyer.status === "pending" && rejectForm && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    onClick: () => setRejectForm(false),
    style: {
      flex: 1
    }
  }, "\u2190 Back"), /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    onClick: () => rejectReason && onReject(buyer.id, rejectReason),
    style: {
      flex: 1,
      opacity: rejectReason ? 1 : .4
    }
  }, "Confirm Reject")), buyer.status !== "pending" && /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    full: true,
    onClick: onClose
  }, "Close"));
}

/* Main page */
function AdminMediaBuyersPage({
  mediaBuyers,
  onApprove,
  onReject
}) {
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const pending = mediaBuyers.filter(m => m.status === "pending");
  const approved = mediaBuyers.filter(m => m.status === "approved");
  const rejected = mediaBuyers.filter(m => m.status === "rejected");
  const displayed = tab === "all" ? mediaBuyers : mediaBuyers.filter(m => m.status === tab);
  const handleApprove = id => {
    onApprove(id);
    setSelected(null);
  };
  const handleReject = (id, reason) => {
    onReject(id, reason);
    setSelected(null);
  };
  return /*#__PURE__*/React.createElement(PageShell, {
    breadcrumb: "Dashboard \u203A Media Buyers",
    title: "Media Buyers Management",
    subtitle: "Review applications, manage approvals, and monitor performance insights.",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "exp",
      variant: "outline"
    }, "\u2191 Export")]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: 14,
      marginBottom: 22
    }
  }, [[C.blue, "👤", "Total Applications", mediaBuyers.length, "3 this week"], [C.yellow, "⏳", "Pending Review", pending.length, null], [C.green, "✓", "Approved", approved.length, "2 this week"], [C.red, "✕", "Rejected", rejected.length, null], [C.primary, "💰", "Avg. Monthly Rate", `$${Math.round(approved.reduce((a, m) => a + m.rate, 0) / (approved.length || 1))}`, null]].map(([col, ic, l, v, sub]) => /*#__PURE__*/React.createElement(Card, {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      background: col + "20",
      borderRadius: 11,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      marginBottom: 12
    }
  }, ic), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 4
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      color: C.g800
    }
  }, v), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.green,
      marginTop: 4
    }
  }, "\u2191 ", sub)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontSize: 14,
      fontWeight: 800,
      color: C.g800
    }
  }, "Platform Coverage (Approved Buyers)"), ["Meta", "Google", "TikTok", "Snapchat"].map(p => {
    const count = approved.filter(m => m.platforms.includes(p)).length;
    const pct = approved.length ? count / approved.length * 100 : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: p,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(PlatformIcon, {
      name: p,
      size: 18
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: C.g600,
        width: 80
      }
    }, p), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 8,
        background: C.g100,
        borderRadius: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${pct}%`,
        height: "100%",
        background: C.primary,
        borderRadius: 4,
        transition: "width .5s"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: C.g500,
        width: 20
      }
    }, count));
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 16px",
      fontSize: 14,
      fontWeight: 800,
      color: C.g800
    }
  }, "Performance (Approved Buyers)"), approved.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "20px",
      color: C.g400,
      fontSize: 14
    }
  }, "No approved buyers yet") : approved.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: m.avatar,
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.g700
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400
    }
  }, m.orders, " orders \xB7 ", m.spent)), m.rating > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.yellow
    }
  }, "⭐".repeat(Math.floor(m.rating))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 900,
      color: C.primary
    }
  }, "$", m.rate, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: C.g400
    }
  }, "/mo")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderBottom: `2px solid ${C.g200}`,
      marginBottom: 20
    }
  }, [["all", "All Applications", mediaBuyers.length], ["pending", "Pending", pending.length], ["approved", "Approved", approved.length], ["rejected", "Rejected", rejected.length]].map(([id, l, count]) => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setTab(id),
    style: {
      padding: "12px 22px",
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: tab === id ? 800 : 400,
      color: tab === id ? C.primary : C.g500,
      borderBottom: tab === id ? `2px solid ${C.primary}` : "2px solid transparent",
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: -2
    }
  }, l, /*#__PURE__*/React.createElement("span", {
    style: {
      background: tab === id ? C.primary : C.g200,
      color: tab === id ? "#fff" : C.g500,
      fontSize: 11,
      fontWeight: 800,
      padding: "2px 8px",
      borderRadius: 20
    }
  }, count)))), displayed.length === 0 ? /*#__PURE__*/React.createElement(Card, {
    style: {
      textAlign: "center",
      padding: "48px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48,
      marginBottom: 14
    }
  }, "\uD83D\uDCED"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: C.g600
    }
  }, "No applications in this category")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, displayed.map(buyer => /*#__PURE__*/React.createElement(Card, {
    key: buyer.id,
    onClick: () => setSelected(buyer),
    style: {
      cursor: "pointer",
      transition: "box-shadow .15s"
    },
    onMouseEnter: e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)",
    onMouseLeave: e => e.currentTarget.style.boxShadow = "none"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: buyer.avatar,
    size: 52
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 900,
      fontSize: 15,
      color: C.g800
    }
  }, buyer.name), /*#__PURE__*/React.createElement(Badge, {
    status: buyer.status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.g500,
      marginBottom: 6
    }
  }, buyer.speciality, " \xB7 ", buyer.email), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, buyer.platforms.map(p => /*#__PURE__*/React.createElement(PlatformIcon, {
    key: p,
    name: p,
    size: 16
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      minWidth: 130
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 900,
      color: C.primary
    }
  }, "$", buyer.rate, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: C.g400,
      fontWeight: 400
    }
  }, "/mo")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginTop: 4
    }
  }, buyer.experience, " experience"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginTop: 2
    }
  }, "Applied: ", buyer.joined)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7,
      marginLeft: 8
    }
  }, buyer.status === "pending" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Btn, {
    variant: "success",
    size: "sm",
    onClick: e => {
      e.stopPropagation();
      handleApprove(buyer.id);
    }
  }, "\u2713 Approve"), /*#__PURE__*/React.createElement(Btn, {
    variant: "danger",
    size: "sm",
    onClick: e => {
      e.stopPropagation();
      setSelected(buyer);
    }
  }, "\u2715 Reject")) : /*#__PURE__*/React.createElement(Btn, {
    variant: "outline",
    size: "sm",
    onClick: e => {
      e.stopPropagation();
      setSelected(buyer);
    }
  }, "View Details"))), buyer.rejectReason && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      padding: "10px 14px",
      background: C.redL,
      borderRadius: 9,
      fontSize: 12,
      color: C.red
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Rejection Reason:"), " ", buyer.rejectReason)))), selected && /*#__PURE__*/React.createElement(ApplicationModal, {
    buyer: selected,
    onApprove: handleApprove,
    onReject: handleReject,
    onClose: () => setSelected(null)
  }));
}

/* ===== AdminOtherPages.jsx ===== */

/* ═══════════════════════════════════════════════════
   ADMIN INVENTORY PAGE
═══════════════════════════════════════════════════ */
function AddAccountForm({
  onCancel
}) {
  return /*#__PURE__*/React.createElement(PageShell, {
    breadcrumb: "Dashboard \u203A Pre-Verified Accounts \u203A Add New Account",
    title: "Add New Account",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "c",
      variant: "outline",
      onClick: onCancel
    }, "\u2715 Cancel"), /*#__PURE__*/React.createElement(Btn, {
      key: "s"
    }, "\uD83D\uDCBE Save Account")]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 18px",
      fontSize: 15,
      fontWeight: 800
    }
  }, "Product Information"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: `2px dashed ${C.g200}`,
      borderRadius: 12,
      padding: 32,
      textAlign: "center",
      marginBottom: 16,
      cursor: "pointer",
      background: C.g50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      color: C.primary,
      marginBottom: 8
    }
  }, "\u2191"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: C.g500
    }
  }, "Click to upload product logo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g300,
      marginTop: 4
    }
  }, "PNG, JPG or WEBP (Max. 2MB)")), /*#__PURE__*/React.createElement(Input, {
    label: "Product Title",
    required: true,
    placeholder: "e.g. Meta Aged Accounts (US)"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Short Description",
    placeholder: "Brief description about this account type"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Platform",
    required: true,
    options: ["Meta", "Google", "TikTok", "Snapchat"]
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Account Type",
    required: true,
    options: ["Aged", "Fresh"]
  })), /*#__PURE__*/React.createElement(Select, {
    label: "Country",
    required: true,
    options: ["🇺🇸 United States", "🇬🇧 United Kingdom", "🇫🇷 France", "🇲🇦 Morocco", "🇦🇪 UAE"]
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Price (USD)",
    required: true,
    type: "number",
    placeholder: "120.00"
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 18px",
      fontSize: 15,
      fontWeight: 800
    }
  }, "Product Description"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: `1px solid ${C.g200}`,
      borderRadius: 11,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      padding: "8px 12px",
      borderBottom: `1px solid ${C.g200}`,
      display: "flex",
      gap: 8,
      fontSize: 13,
      color: C.g500
    }
  }, /*#__PURE__*/React.createElement("select", {
    style: {
      background: "transparent",
      border: "none",
      fontSize: 12,
      fontFamily: "inherit"
    }
  }, /*#__PURE__*/React.createElement("option", null, "Paragraph")), ["B", "I", "U"].map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    style: {
      background: "none",
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
      color: C.g500,
      fontFamily: "inherit"
    }
  }, f))), /*#__PURE__*/React.createElement("textarea", {
    rows: 8,
    placeholder: "Write a detailed description about this account type\u2026",
    style: {
      width: "100%",
      border: "none",
      padding: "12px 14px",
      fontSize: 13,
      resize: "none",
      boxSizing: "border-box",
      outline: "none",
      fontFamily: "inherit"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 12px",
      borderTop: `1px solid ${C.g200}`,
      fontSize: 11,
      color: C.g300,
      textAlign: "right"
    }
  }, "0 / 5000")))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 8px",
      fontSize: 15,
      fontWeight: 800
    }
  }, "Bulk Add Inventory"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "#fff7ed",
      border: `1px solid ${C.yellow}40`,
      borderRadius: 9,
      padding: "10px 14px",
      marginBottom: 16,
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.yellow
    }
  }, "\u26A0"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "#92400e"
    }
  }, "Each line = 1 account. Format: email | password | 2fa")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    rows: 8,
    placeholder: `john.doe@gmail.com | Passw0rd@123 | J3K4 5G6H 7J8K\nalex.smith@gmail.com | Passw0rd@123 | L1M2 3N4O 5P6Q`,
    style: {
      width: "100%",
      border: `1px solid ${C.g200}`,
      borderRadius: 10,
      padding: "12px 14px",
      fontSize: 13,
      resize: "vertical",
      boxSizing: "border-box",
      fontFamily: "monospace",
      background: C.g50,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 12,
      padding: 18,
      width: 220
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: "0 0 12px",
      fontSize: 13,
      fontWeight: 800,
      color: C.g700
    }
  }, "Notes"), ["Each account on its own line.", "Format: email | password | 2fa", "2FA: any format accepted", "Editable after saving."].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      fontSize: 12,
      color: C.g500,
      marginBottom: 8,
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: C.primary
    }
  }, "\u2022"), n))))));
}
function AdminInventoryPage() {
  const [view, setView] = useState("list");
  if (view === "add") return /*#__PURE__*/React.createElement(AddAccountForm, {
    onCancel: () => setView("list")
  });
  const cols = [{
    label: "",
    render: () => /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    }),
    style: {
      width: 40
    }
  }, {
    label: "ID",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        color: C.primary,
        fontSize: 12
      }
    }, r.id)
  }, {
    label: "Email",
    render: r => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "monospace",
        fontSize: 12,
        color: C.g500
      }
    }, r.email, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\uD83D\uDC41"))
  }, {
    label: "Password",
    render: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "monospace",
        fontSize: 12,
        color: C.g300
      }
    }, "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\uD83D\uDC41"))
  }, {
    label: "2FA",
    render: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "monospace",
        fontSize: 12,
        color: C.g300
      }
    }, "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\uD83D\uDC41"))
  }, {
    label: "Status",
    render: r => /*#__PURE__*/React.createElement(Badge, {
      status: r.status
    })
  }, {
    label: "Added On",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g400
      }
    }, r.date)
  }, {
    label: "Actions",
    render: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\uD83D\uDC41"), /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer",
        color: C.red
      }
    }, "\uD83D\uDDD1"))
  }];
  return /*#__PURE__*/React.createElement(PageShell, {
    breadcrumb: "Dashboard \u203A Pre-Verified Accounts \u203A Inventory",
    title: "Inventory",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "e",
      variant: "outline"
    }, "\u2191 Export"), /*#__PURE__*/React.createElement(Btn, {
      key: "b",
      variant: "outline"
    }, "\u2193 Bulk Import"), /*#__PURE__*/React.createElement(Btn, {
      key: "a",
      onClick: () => setView("add")
    }, "+ Add Accounts")]
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      background: "#1877f210",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 26
    }
  }, "\u2133"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 900
    }
  }, "Meta Aged Accounts (US)"), /*#__PURE__*/React.createElement(Badge, {
    status: "active"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, [["Platform: Meta", C.blueL], ["Type: Aged", C.greenL], ["Country: United States", "#ede9fe"]].map(([t, bg]) => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      background: bg,
      color: C.g600,
      fontSize: 11,
      padding: "3px 10px",
      borderRadius: 20,
      fontWeight: 700
    }
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 24,
      textAlign: "center"
    }
  }, [["Total", "1,200", C.g600], ["Available", "980", C.green], ["Sold", "180", C.blue], ["Reserved", "40", C.yellow]].map(([l, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: C.g400,
      marginBottom: 4
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 900,
      color: c
    }
  }, v))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "\uD83D\uDD0D Search by email or ID\u2026",
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      width: 230,
      fontFamily: "inherit",
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }, /*#__PURE__*/React.createElement("option", null, "All Status"), /*#__PURE__*/React.createElement("option", null, "Available"), /*#__PURE__*/React.createElement("option", null, "Reserved"), /*#__PURE__*/React.createElement("option", null, "Sold")))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(DataTable, {
    cols: cols,
    rows: MOCK_INVENTORY
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 22px",
      borderTop: `1px solid ${C.g200}`
    }
  }, /*#__PURE__*/React.createElement(Pagination, {
    total: "1,200 accounts",
    showing: "1\u201310",
    pages: ["‹", 1, 2, 3, "...", 60, "›"]
  }))));
}

/* ═══════════════════════════════════════════════════
   ADMIN USERS PAGE
═══════════════════════════════════════════════════ */
function AdminUsersPage() {
  const cols = [{
    label: "",
    render: () => /*#__PURE__*/React.createElement("input", {
      type: "checkbox"
    }),
    style: {
      width: 40
    }
  }, {
    label: "User",
    render: r => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      initials: r.name.split(" ").map(w => w[0]).join(""),
      size: 32
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13
      }
    }, r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: C.g400
      }
    }, r.email)))
  }, {
    label: "Balance",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: C.primary
      }
    }, "$", r.balance.toLocaleString(), ".00")
  }, {
    label: "Accounts",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700
      }
    }, r.accounts)
  }, {
    label: "Status",
    render: r => /*#__PURE__*/React.createElement(Badge, {
      status: r.status
    })
  }, {
    label: "Joined",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g400
      }
    }, r.joined)
  }, {
    label: "Actions",
    render: () => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\uD83D\uDC41"), /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\u270F\uFE0F"), /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer",
        color: C.red
      }
    }, "\uD83D\uDEAB"))
  }];
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Users",
    subtitle: "Manage all platform users.",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "add"
    }, "+ Add New User"), /*#__PURE__*/React.createElement(Btn, {
      key: "exp",
      variant: "outline"
    }, "\u2191 Export")]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 14,
      marginBottom: 22
    }
  }, [["Total Users", "1,248", C.blue], ["Active", "892", C.green], ["Banned", "45", C.red], ["Pending", "78", C.yellow]].map(([l, v, c]) => /*#__PURE__*/React.createElement(Card, {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 6
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      color: c
    }
  }, v)))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "\uD83D\uDD0D Search users\u2026",
    style: {
      flex: 1,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }, /*#__PURE__*/React.createElement("option", null, "All Status"), /*#__PURE__*/React.createElement("option", null, "Active"), /*#__PURE__*/React.createElement("option", null, "Banned"), /*#__PURE__*/React.createElement("option", null, "Pending"))), /*#__PURE__*/React.createElement(DataTable, {
    cols: cols,
    rows: MOCK_USERS
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Pagination, {
    total: "1,248 users",
    showing: `1–${MOCK_USERS.length}`,
    pages: ["‹", 1, 2, 3, "...", 125, "›"]
  }))));
}

/* ═══════════════════════════════════════════════════
   ADMIN ORDERS PAGE
═══════════════════════════════════════════════════ */
function AdminOrdersPage() {
  const cols = [{
    label: "Order ID",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: C.g700
      }
    }, r.id)
  }, {
    label: "User",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g500
      }
    }, r.user)
  }, {
    label: "Type",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, r.type)
  }, {
    label: "Platform",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, r.platform)
  }, {
    label: "Amount",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 800,
        color: C.primary
      }
    }, "$", r.amount, ".00")
  }, {
    label: "Status",
    render: r => /*#__PURE__*/React.createElement(Badge, {
      status: r.status
    })
  }, {
    label: "Date",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g400
      }
    }, r.date)
  }, {
    label: "Actions",
    render: () => /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer"
      }
    }, "\uD83D\uDC41")
  }];
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Orders",
    subtitle: "View and manage all platform orders.",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "exp",
      variant: "outline"
    }, "\u2191 Export")]
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 14,
      marginBottom: 22
    }
  }, [["Total Orders", "3,987", C.blue], ["Completed", "3,245", C.green], ["Processing", "521", C.yellow], ["Pending", "221", C.red]].map(([l, v, c]) => /*#__PURE__*/React.createElement(Card, {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 6
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 900,
      color: c
    }
  }, v)))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "\uD83D\uDD0D Search orders\u2026",
    style: {
      flex: 1,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }, /*#__PURE__*/React.createElement("option", null, "All Status"), /*#__PURE__*/React.createElement("option", null, "Completed"), /*#__PURE__*/React.createElement("option", null, "Processing"), /*#__PURE__*/React.createElement("option", null, "Pending"))), /*#__PURE__*/React.createElement(DataTable, {
    cols: cols,
    rows: MOCK_ORDERS
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Pagination, {
    total: "3,987 orders",
    showing: `1–${MOCK_ORDERS.length}`,
    pages: ["‹", 1, 2, 3, "...", 399, "›"]
  }))));
}

/* ═══════════════════════════════════════════════════
   ADMIN DEPOSITS PAGE
═══════════════════════════════════════════════════ */
function AdminDepositsPage() {
  const [deposits, setDeposits] = useState(MOCK_DEPOSITS);
  const approve = id => setDeposits(p => p.map(d => d.id === id ? {
    ...d,
    status: "completed"
  } : d));
  const reject = id => setDeposits(p => p.map(d => d.id === id ? {
    ...d,
    status: "rejected"
  } : d));
  const cols = [{
    label: "Deposit ID",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: C.primary,
        fontSize: 12
      }
    }, r.id)
  }, {
    label: "User",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g500
      }
    }, r.user)
  }, {
    label: "Method",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, r.method)
  }, {
    label: "Amount",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 900,
        color: C.green
      }
    }, "$", r.amount.toFixed(2))
  }, {
    label: "Status",
    render: r => /*#__PURE__*/React.createElement(Badge, {
      status: r.status
    })
  }, {
    label: "Proof",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.blue,
        cursor: "pointer"
      }
    }, r.proof)
  }, {
    label: "Date",
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.g400
      }
    }, r.date)
  }, {
    label: "Actions",
    render: r => r.status === "pending" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      variant: "success",
      size: "sm",
      onClick: () => approve(r.id)
    }, "\u2713 Approve"), /*#__PURE__*/React.createElement(Btn, {
      variant: "danger",
      size: "sm",
      onClick: () => reject(r.id)
    }, "\u2715 Reject")) : /*#__PURE__*/React.createElement(Badge, {
      status: r.status
    })
  }];
  const pending = deposits.filter(d => d.status === "pending");
  return /*#__PURE__*/React.createElement(PageShell, {
    title: "Deposits",
    subtitle: "Review and approve user deposit requests.",
    actions: [/*#__PURE__*/React.createElement(Btn, {
      key: "exp",
      variant: "outline"
    }, "\u2191 Export")]
  }, pending.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.yellowL,
      border: `1px solid ${C.yellow}40`,
      borderRadius: 12,
      padding: "14px 20px",
      marginBottom: 22,
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22
    }
  }, "\u23F3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "#92400e"
    }
  }, pending.length, " deposit", pending.length > 1 ? "s" : "", " pending review"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "#a16207",
      marginTop: 2
    }
  }, "Review and approve or reject the deposits below."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 14,
      marginBottom: 22
    }
  }, [["Total Deposits", "$86,245.30", C.blue], ["Approved", "$85,095.30", C.green], ["Pending", "$700.00", C.yellow], ["Rejected", "$450.00", C.red]].map(([l, v, c]) => /*#__PURE__*/React.createElement(Card, {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: C.g400,
      marginBottom: 6
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 900,
      color: c
    }
  }, v)))), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "\uD83D\uDD0D Search deposits\u2026",
    style: {
      flex: 1,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("select", {
    style: {
      background: C.g50,
      border: `1px solid ${C.g200}`,
      borderRadius: 9,
      padding: "9px 14px",
      fontSize: 13,
      fontFamily: "inherit",
      outline: "none"
    }
  }, /*#__PURE__*/React.createElement("option", null, "All Status"), /*#__PURE__*/React.createElement("option", null, "Pending"), /*#__PURE__*/React.createElement("option", null, "Completed"), /*#__PURE__*/React.createElement("option", null, "Rejected"))), /*#__PURE__*/React.createElement(DataTable, {
    cols: cols,
    rows: deposits
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Pagination, {
    total: `${deposits.length} deposits`,
    showing: `1–${deposits.length}`,
    pages: ["‹", 1, 2, "›"]
  }))));
}

/* ===== App.jsx ===== */

/* ─── Auth Pages ─── */

/* ─── User Pages ─── */

/* ─── Admin Pages ─── */

/* ─── Shared Layout ─── */

function App() {
  /* ── Auth state ── */
  const [screen, setScreen] = useState("login"); // login | register | admin-login | app
  const [role, setRole] = useState("user");
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com"
  });
  const [page, setPage] = useState("dashboard");

  /* ── Shared domain state ── */
  const [balance, setBalance] = useState(1240.00);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [mediaBuyers, setMediaBuyers] = useState(MOCK_MEDIA_BUYERS);

  /* ── Auth handlers ── */
  const handleLogin = (r, u) => {
    setRole(r);
    setUser(u);
    setPage(r === "admin" ? "admin-dashboard" : "dashboard");
    setScreen("app");
  };
  const handleLogout = () => {
    setScreen("login");
    setPage("dashboard");
  };

  /* ── Media buyer handlers ── */
  const approveBuyer = id => setMediaBuyers(p => p.map(m => m.id === id ? {
    ...m,
    status: "approved"
  } : m));
  const rejectBuyer = (id, reason) => setMediaBuyers(p => p.map(m => m.id === id ? {
    ...m,
    status: "rejected",
    rejectReason: reason
  } : m));

  /* ── Balance handlers ── */
  const addTransaction = tx => {
    setTransactions(p => [tx, ...p]);
  };

  /* ════════════════════════════════════════════════
     Auth screens
  ════════════════════════════════════════════════ */
  if (screen === "login") return /*#__PURE__*/React.createElement(UserLoginPage, {
    onLogin: (r, u) => handleLogin(r, u),
    goToAdmin: () => setScreen("admin-login")
  });
  if (screen === "register") return /*#__PURE__*/React.createElement(RegisterPage, {
    onLogin: handleLogin,
    goToLogin: () => setScreen("login")
  });
  if (screen === "admin-login") return /*#__PURE__*/React.createElement(AdminLoginPage, {
    onLogin: handleLogin,
    goToUserLogin: () => setScreen("login")
  });

  /* ════════════════════════════════════════════════
     App shell
  ════════════════════════════════════════════════ */
  const renderPage = () => {
    /* ── USER ROUTES ── */
    if (role === "user") {
      switch (page) {
        case "dashboard":
          return /*#__PURE__*/React.createElement(UserDashboard, {
            balance: balance,
            setPage: setPage
          });
        case "ad-accounts":
          return /*#__PURE__*/React.createElement(AdAccountsPage, {
            balance: balance,
            setPage: setPage
          });
        case "balance":
          return /*#__PURE__*/React.createElement(BalancePage, {
            balance: balance,
            addTransaction: addTransaction
          });
        case "pre-verified":
          return /*#__PURE__*/React.createElement(PreVerifiedPage, null);
        case "media-buyers":
          return /*#__PURE__*/React.createElement(MediaBuyersPage, {
            mediaBuyers: mediaBuyers
          });
        case "projects":
          return /*#__PURE__*/React.createElement(ProjectsPage, null);
        case "support":
          return /*#__PURE__*/React.createElement(SupportPage, null);
        default:
          return /*#__PURE__*/React.createElement(UserDashboard, {
            balance: balance,
            setPage: setPage
          });
      }
    }

    /* ── ADMIN ROUTES ── */
    switch (page) {
      case "admin-dashboard":
        return /*#__PURE__*/React.createElement(AdminDashboard, {
          mediaBuyers: mediaBuyers,
          setPage: setPage
        });
      case "admin-media-buyers":
        return /*#__PURE__*/React.createElement(AdminMediaBuyersPage, {
          mediaBuyers: mediaBuyers,
          onApprove: approveBuyer,
          onReject: rejectBuyer
        });
      case "admin-inventory":
        return /*#__PURE__*/React.createElement(AdminInventoryPage, null);
      case "admin-users":
        return /*#__PURE__*/React.createElement(AdminUsersPage, null);
      case "admin-orders":
        return /*#__PURE__*/React.createElement(AdminOrdersPage, null);
      case "admin-deposits":
        return /*#__PURE__*/React.createElement(AdminDepositsPage, null);
      default:
        return /*#__PURE__*/React.createElement(AdminDashboard, {
          mediaBuyers: mediaBuyers,
          setPage: setPage
        });
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      fontFamily: "'Sora',sans-serif"
    }
  }, /*#__PURE__*/React.createElement("link", {
    href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap",
    rel: "stylesheet"
  }), /*#__PURE__*/React.createElement(Sidebar, {
    role: role,
    activePage: page,
    setActivePage: setPage,
    logout: handleLogout
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    role: role,
    user: user,
    balance: balance
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: "#f5f5f8"
    }
  }, renderPage())));
}
