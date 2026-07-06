import {
  User, ShieldCheck, Building2, Megaphone, Briefcase, FileStack, Heart,
  Activity, Database, Globe, Users, UserCog, TrendingUp
} from 'lucide-react'

export const NODE_REGISTRY = {
  profile:            { label: 'Profile',            icon: User,           price: 40,  glow: '#3b82f6' },
  bm_verified:        { label: 'BM Verified',        icon: ShieldCheck,    price: 250, glow: '#10b981' },
  agency_bm:          { label: 'Agency BM',          icon: Building2,      price: 300, glow: '#8b5cf6' },
  advertiser_account: { label: 'Advertiser Account', icon: Megaphone,      price: 60,  glow: '#f59e0b' },
  client_ad_account:  { label: 'Client Ad Account',  icon: Briefcase,      price: 60,  glow: '#06b6d4' },
  pages_bm:           { label: 'Pages BM',           icon: FileStack,      price: 80,  glow: '#ec4899' },
  fan_page:           { label: 'Fan Page',           icon: Heart,          price: 35,  glow: '#ef4444' },
  pixel:              { label: 'Pixel',              icon: Activity,       price: 25,  glow: '#14b8a6' },
  dataset:            { label: 'Dataset',            icon: Database,       price: 20,  glow: '#6366f1' },
  domain:             { label: 'Domain',             icon: Globe,          price: 30,  glow: '#f97316' },
  backup_admin:       { label: 'Backup Admin',       icon: Users,          price: 25,  glow: '#84cc16' },
  employee:           { label: 'Employee',           icon: UserCog,        price: 15,  glow: '#64748b' },
  media_buyer:        { label: 'Media Buyer',        icon: TrendingUp,     price: 45,  glow: '#d946ef' },
}

export const NODE_KEYS = Object.keys(NODE_REGISTRY)

export const CONNECTION_REGISTRY = {
  admin:             { label: 'Admin',              color: '#ef4444' },
  partner:           { label: 'Partner',            color: '#3b82f6' },
  advertiser_access: { label: 'Advertiser Access',  color: '#f59e0b' },
  employee:          { label: 'Employee',           color: '#10b981' },
  pixel_sharing:     { label: 'Pixel Sharing',      color: '#8b5cf6' },
  domain_sharing:    { label: 'Domain Sharing',     color: '#06b6d4' },
}

export const CONNECTION_KEYS = Object.keys(CONNECTION_REGISTRY)

export function getNodeMeta(key) {
  return NODE_REGISTRY[key] || NODE_REGISTRY.profile
}

export function getConnectionMeta(key) {
  return CONNECTION_REGISTRY[key] || CONNECTION_REGISTRY.admin
}
