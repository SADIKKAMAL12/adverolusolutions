export const MOCK_TRANSACTIONS = [
  { id: 1, type: "Deposit",      method: "Payoneer",       amount:  350,  status: "pending",   date: "May 19, 2024 10:30 AM" },
  { id: 2, type: "Deposit",      method: "USDT (TRC20)",   amount:  200,  status: "completed", date: "May 17, 2024 08:15 PM" },
  { id: 3, type: "Top Up Bonus", method: "System",         amount:   20,  status: "completed", date: "May 17, 2024 08:16 PM" },
  { id: 4, type: "Spent",        method: "Ad Account",     amount: -120,  status: "completed", date: "May 16, 2024 03:45 PM" },
  { id: 5, type: "Deposit",      method: "Bank Transfer",  amount:  500,  status: "completed", date: "May 15, 2024 11:20 AM" },
  { id: 6, type: "Spent",        method: "Pre-Verified",   amount:  -95,  status: "completed", date: "May 14, 2024 02:10 PM" },
  { id: 7, type: "Deposit",      method: "Wise",           amount:  300,  status: "completed", date: "May 12, 2024 09:00 AM" },
  { id: 8, type: "Refund",       method: "System",         amount:   50,  status: "completed", date: "May 11, 2024 04:30 PM" },
];

export const MOCK_AD_ACCOUNTS = [
  { name: "Meta Ads Account 01",     id: "META-468102", platform: "Meta",     type: "Agency Account", user: "john.doe@example.com",  balance: 250, status: "active",    date: "May 25, 2024" },
  { name: "Google Ads Account 02",   id: "GGL-784512",  platform: "Google",   type: "Client Account", user: "william@exemple.com",   balance: 150, status: "active",    date: "May 25, 2024" },
  { name: "TikTok Ads Account 03",   id: "TTK-951753",  platform: "TikTok",   type: "Agency Account", user: "emma@exemple.com",      balance: 100, status: "pending",   date: "May 25, 2024" },
  { name: "Snapchat Ads Account 04", id: "SCP-357159",  platform: "Snapchat", type: "Client Account", user: "olivia@exemple.com",    balance:  80, status: "active",    date: "May 24, 2024" },
  { name: "Meta Ads Account 05",     id: "META-357951", platform: "Meta",     type: "Agency Account", user: "james@exemple.com",     balance: 200, status: "disabled",  date: "May 23, 2024" },
];

export const MOCK_INVENTORY = Array.from({ length: 10 }, (_, i) => ({
  id: `PVA-${String(i + 1).padStart(4, "0")}`,
  email: ["john.doe***@gmail.com","alex.smi***@gmail.com","mark.joh***@gmail.com","sarah.wil***@gmail.com","james.bro***@gmail.com"][i % 5],
  status: ["available","reserved","sold","available","available","sold","disabled","available","reserved","available"][i],
  date: "May 29, 2024",
}));

export const MOCK_MEDIA_BUYERS = [
  { id: 1, name: "Alex Morgan",    avatar: "AM", email: "alex@mediapro.com",    speciality: "Meta Ads Expert",         platforms: ["Meta","Google"],           experience: "5 years", spent: "$2.4M+", rate: 350, rating: 4.9, reviews: 128, orders: 156, status: "approved", joined: "May 1, 2024",   portfolio: "https://alexmorgan.media"  },
  { id: 2, name: "Sarah Johnson",  avatar: "SJ", email: "sarah@adspro.com",     speciality: "Google Ads Specialist",   platforms: ["Google"],                  experience: "4 years", spent: "$1.8M+", rate: 320, rating: 4.8, reviews:  96, orders: 112, status: "approved", joined: "Apr 15, 2024",  portfolio: "https://sarahjohnson.ads"  },
  { id: 3, name: "David Lee",      avatar: "DL", email: "david@tiktokads.io",   speciality: "TikTok Ads Expert",       platforms: ["TikTok"],                  experience: "3 years", spent: "$1.2M+", rate: 300, rating: 4.7, reviews:   0, orders:   0, status: "pending",  joined: "May 20, 2024",  portfolio: "https://davidlee.io"        },
  { id: 4, name: "Emily Carter",   avatar: "EC", email: "emily@fullads.com",    speciality: "Snapchat Ads Expert",     platforms: ["Snapchat","Meta"],         experience: "6 years", spent: "$950K+", rate: 280, rating: 4.9, reviews:   0, orders:   0, status: "pending",  joined: "May 22, 2024",  portfolio: "https://emilycarter.ads"   },
  { id: 5, name: "Michael Brown",  avatar: "MB", email: "mike@adscale.com",     speciality: "Meta & TikTok Expert",    platforms: ["Meta","TikTok"],           experience: "4 years", spent: "$1.6M+", rate: 400, rating: 4.6, reviews:  58, orders:  84, status: "approved", joined: "Mar 10, 2024",  portfolio: "https://mikebrown.media"   },
  { id: 6, name: "James Wilson",   avatar: "JW", email: "james@googleads.pro",  speciality: "Google & YouTube Ads",   platforms: ["Google"],                  experience: "2 years", spent: "$780K+", rate: 250, rating:   0, reviews:   0, orders:   0, status: "rejected", joined: "May 18, 2024",  portfolio: "https://jameswilson.pro",  rejectReason: "Insufficient portfolio documentation" },
  { id: 7, name: "Daniel Sanchez", avatar: "DS", email: "daniel@tikpro.io",     speciality: "TikTok & Meta Expert",   platforms: ["TikTok","Meta"],           experience: "3 years", spent: "$1.1M+", rate: 330, rating:   0, reviews:   0, orders:   0, status: "pending",  joined: "May 25, 2024",  portfolio: "https://danielsanchez.io"  },
  { id: 8, name: "Sophia Martinez",avatar: "SM", email: "sophia@fullfunnel.co", speciality: "Full Funnel Specialist",  platforms: ["Meta","Google","TikTok"],  experience: "7 years", spent: "$2.2M+", rate: 450, rating: 4.8, reviews:  91, orders: 131, status: "approved", joined: "Feb 5, 2024",   portfolio: "https://sophiamartinez.co" },
];

export const MOCK_ORDERS = [
  { id: "ORD-98765", user: "john.doe@example.com",  type: "Ad Account",          platform: "Meta",     amount: 120, status: "completed",  date: "May 25, 2024" },
  { id: "ORD-98764", user: "william@example.com",   type: "Pre-Verified Account",platform: "Google",   amount: 150, status: "completed",  date: "May 25, 2024" },
  { id: "ORD-98763", user: "emma@example.com",      type: "Ad Account",          platform: "TikTok",   amount: 100, status: "processing", date: "May 25, 2024" },
  { id: "ORD-98762", user: "olivia@example.com",    type: "Ad Account",          platform: "Snapchat", amount:  90, status: "pending",    date: "May 25, 2024" },
  { id: "ORD-98761", user: "james@example.com",     type: "Pre-Verified Account",platform: "Meta",     amount: 110, status: "completed",  date: "May 25, 2024" },
];

export const MOCK_USERS = [
  { id: 1,  name: "John Doe",       email: "john.doe@example.com",   balance: 1240, accounts: 12, status: "active",   joined: "Jan 5, 2024"   },
  { id: 2,  name: "William Smith",  email: "william@example.com",    balance:  850, accounts:  8, status: "active",   joined: "Jan 18, 2024"  },
  { id: 3,  name: "Emma Johnson",   email: "emma@example.com",       balance:  320, accounts:  3, status: "active",   joined: "Feb 2, 2024"   },
  { id: 4,  name: "Olivia Brown",   email: "olivia@example.com",     balance: 2100, accounts: 21, status: "active",   joined: "Feb 14, 2024"  },
  { id: 5,  name: "James Wilson",   email: "james@example.com",      balance:    0, accounts:  0, status: "banned",   joined: "Mar 1, 2024"   },
  { id: 6,  name: "Sophia Garcia",  email: "sophia@example.com",     balance:  670, accounts:  5, status: "active",   joined: "Mar 20, 2024"  },
  { id: 7,  name: "Daniel Martinez",email: "daniel@example.com",     balance:    0, accounts:  0, status: "pending",  joined: "Apr 3, 2024"   },
  { id: 8,  name: "Mia Anderson",   email: "mia@example.com",        balance: 1580, accounts: 14, status: "active",   joined: "Apr 15, 2024"  },
];

export const MOCK_DEPOSITS = [
  { id: "DEP-001", user: "john.doe@example.com",  method: "Payoneer",     amount:  350, status: "pending",   date: "May 19, 2024 10:30 AM", proof: "proof_001.png" },
  { id: "DEP-002", user: "william@example.com",   method: "Bank Transfer",amount:  500, status: "completed", date: "May 18, 2024 09:00 AM", proof: "proof_002.pdf" },
  { id: "DEP-003", user: "emma@example.com",      method: "USDT (TRC20)", amount:  200, status: "pending",   date: "May 17, 2024 02:30 PM", proof: "proof_003.png" },
  { id: "DEP-004", user: "olivia@example.com",    method: "Wise",         amount: 1000, status: "completed", date: "May 16, 2024 11:00 AM", proof: "proof_004.jpg" },
  { id: "DEP-005", user: "sophia@example.com",    method: "Binance",      amount:  150, status: "pending",   date: "May 15, 2024 04:15 PM", proof: "proof_005.png" },
];
