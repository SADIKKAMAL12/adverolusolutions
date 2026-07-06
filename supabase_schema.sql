-- AdverSolutions Supabase Schema
-- Run this in the Supabase SQL Editor

-- Users table (custom auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned', 'suspended')),
  phone TEXT,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  accounts INTEGER NOT NULL DEFAULT 0,
  joined TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  method TEXT,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Account Requests
CREATE TABLE IF NOT EXISTS ad_account_requests (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT,
  platform TEXT NOT NULL,
  account_name TEXT,
  timezone TEXT,
  currency TEXT,
  websites JSONB,
  page_links JSONB,
  bm_id TEXT,
  business_name TEXT,
  business_type TEXT,
  business_email TEXT,
  country TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount NUMERIC(12,2),
  request_id TEXT,
  submitted_at TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to existing table if already created without them
ALTER TABLE ad_account_requests ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE ad_account_requests ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE ad_account_requests ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE ad_account_requests ADD COLUMN IF NOT EXISTS request_id TEXT;
ALTER TABLE ad_account_requests ADD COLUMN IF NOT EXISTS submitted_at TEXT;

-- Inventory Products
CREATE TABLE IF NOT EXISTS inventory_products (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  country TEXT,
  created TEXT,
  logo TEXT
);

-- Inventory Lines (individual credentials)
CREATE TABLE IF NOT EXISTS inventory_lines (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES inventory_products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  twofa TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved'))
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES inventory_products(id),
  product_title TEXT,
  platform TEXT,
  price NUMERIC(12,2),
  line_id TEXT REFERENCES inventory_lines(id),
  email TEXT,
  password TEXT,
  twofa TEXT,
  purchased_at TEXT,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_name TEXT,
  client_email TEXT,
  buyer_name TEXT,
  budget NUMERIC(12,2),
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  updates JSONB DEFAULT '[]'::jsonb,
  files JSONB DEFAULT '[]'::jsonb,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT,
  type TEXT NOT NULL,
  platform TEXT,
  item TEXT,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits
CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  account TEXT,
  proof TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Buyers
CREATE TABLE IF NOT EXISTS media_buyers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  speciality TEXT,
  platforms JSONB,
  experience TEXT,
  spent TEXT,
  rate NUMERIC(12,2),
  rating NUMERIC(3,2),
  reviews INTEGER DEFAULT 0,
  orders INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason TEXT,
  joined TEXT,
  portfolio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bank_name TEXT,
  logo TEXT,
  account TEXT,
  fields JSONB DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Business Types
CREATE TABLE IF NOT EXISTS business_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Prices (admin-controlled pricing per platform)
CREATE TABLE IF NOT EXISTS platform_prices (
  id TEXT PRIMARY KEY,
  price NUMERIC(12,2) NOT NULL DEFAULT 50,
  fee NUMERIC(5,2) NOT NULL DEFAULT 6,
  min_topup NUMERIC(12,2) NOT NULL DEFAULT 200,
  active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE platform_prices ADD COLUMN IF NOT EXISTS min_topup NUMERIC(12,2) NOT NULL DEFAULT 200;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'pending', 'banned', 'suspended'));

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  icon TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy Management
CREATE TABLE IF NOT EXISTS policy_categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_translations (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES policy_categories(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'fr', 'ar')),
  title TEXT NOT NULL,
  short_description TEXT,
  content_html TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (category_id, language)
);

-- ========================
-- SEED DATA
-- ========================

-- Seed users (passwords are 'password123' hashed with bcrypt)
INSERT INTO users (id, name, email, password_hash, role, status, balance, accounts, joined) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John Doe', 'john.doe@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 1240, 12, 'Jan 5, 2024'),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'William Smith', 'william@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 850, 8, 'Jan 18, 2024'),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Emma Johnson', 'emma@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 320, 3, 'Feb 2, 2024'),
('d4e5f6a7-b8c9-0123-def1-234567890123', 'Olivia Brown', 'olivia@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 2100, 21, 'Feb 14, 2024'),
('e5f6a7b8-c9d0-1234-ef12-345678901234', 'James Wilson', 'james@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'banned', 0, 0, 'Mar 1, 2024'),
('f6a7b8c9-d0e1-2345-f123-456789012345', 'Sophia Garcia', 'sophia@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 670, 5, 'Mar 20, 2024'),
('a7b8c9d0-e1f2-3456-a123-567890123456', 'Daniel Martinez', 'daniel@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'pending', 0, 0, 'Apr 3, 2024'),
('b8c9d0e1-f2a3-4567-b234-678901234567', 'Mia Anderson', 'mia@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active', 1580, 14, 'Apr 15, 2024'),
('c9d0e1f2-a3b4-5678-c345-789012345678', 'Super Admin', 'admin@adversolutions.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active', 0, 0, 'Jan 1, 2024')
ON CONFLICT (email) DO NOTHING;

-- Seed transactions
INSERT INTO transactions (id, user_id, type, method, amount, status, date) VALUES
(1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Deposit', 'Payoneer', 350, 'pending', 'May 19, 2024 10:30 AM'),
(2, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Deposit', 'USDT (TRC20)', 200, 'completed', 'May 17, 2024 08:15 PM'),
(3, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Top Up Bonus', 'System', 20, 'completed', 'May 17, 2024 08:16 PM'),
(4, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Spent', 'Ad Account', -120, 'completed', 'May 16, 2024 03:45 PM'),
(5, 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Deposit', 'Bank Transfer', 500, 'completed', 'May 15, 2024 11:20 AM'),
(6, 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Spent', 'Pre-Verified', -95, 'completed', 'May 14, 2024 02:10 PM'),
(7, 'd4e5f6a7-b8c9-0123-def1-234567890123', 'Deposit', 'Wise', 300, 'completed', 'May 12, 2024 09:00 AM'),
(8, 'f6a7b8c9-d0e1-2345-f123-456789012345', 'Refund', 'System', 50, 'completed', 'May 11, 2024 04:30 PM')
ON CONFLICT DO NOTHING;

-- Seed inventory products
INSERT INTO inventory_products (id, platform, type, title, description, price, country, created) VALUES
('prod-1', 'Meta', 'Aged', 'Meta Aged Accounts (US)', 'High-quality aged Meta Business Manager accounts. BM verified, ready to run ads immediately.', 120, 'United States', 'May 20, 2024'),
('prod-2', 'Google', 'Aged', 'Google Aged Accounts (US)', 'Mature Google Ads accounts with billing history. Perfect for scaling.', 110, 'United States', 'May 18, 2024'),
('prod-3', 'TikTok', 'New', 'TikTok Fresh Accounts', 'Brand new TikTok Business Center accounts. Quick setup, low risk.', 95, 'United States', 'May 22, 2024'),
('prod-4', 'Snapchat', 'Aged', 'Snapchat Aged Accounts', 'Aged Snapchat Ads accounts with spending history. $100/day limit.', 90, 'United States', 'May 15, 2024'),
('prod-5', 'Meta', 'Aged', 'Meta Aged Accounts (UK)', 'UK-based Meta Business Manager accounts. BM verified, GBP billing.', 150, 'United Kingdom', 'May 25, 2024'),
('prod-6', 'Google', 'New', 'Google Fresh Accounts', 'New Google Ads accounts with USD billing. Great for testing.', 85, 'United States', 'May 21, 2024'),
('prod-7', 'TikTok', 'Aged', 'TikTok Aged Accounts', 'Aged TikTok accounts with $180/day spend limit. Stable performance.', 105, 'United States', 'May 19, 2024'),
('prod-8', 'Snapchat', 'New', 'Snapchat Fresh Accounts', 'New Snapchat Ads accounts ready to launch. Low initial limits.', 75, 'United States', 'May 23, 2024')
ON CONFLICT DO NOTHING;

-- Seed inventory lines
INSERT INTO inventory_lines (id, product_id, email, password, twofa, status) VALUES
('l1', 'prod-1', 'john.doe***@gmail.com', 'Pass123!', 'J3K4 5G6H', 'available'),
('l2', 'prod-1', 'alex.smi***@gmail.com', 'Pass456!', 'L1M2 3N4O', 'available'),
('l3', 'prod-1', 'mark.joh***@gmail.com', 'Pass789!', 'P5Q6 7R8S', 'sold'),
('l4', 'prod-2', 'sarah.wil***@gmail.com', 'Ggl123!', 'A1B2 C3D4', 'available'),
('l5', 'prod-2', 'james.bro***@gmail.com', 'Ggl456!', 'E5F6 G7H8', 'available'),
('l6', 'prod-3', 'lisa.tay***@gmail.com', 'Tik123!', 'Z1X2 C3V4', 'available'),
('l7', 'prod-4', 'kevin.lee***@gmail.com', 'Snap123!', 'B1N2 M3K4', 'available'),
('l8', 'prod-5', 'emma.wat***@gmail.com', 'MetaUK1!', 'Q1W2 E3R4', 'available'),
('l9', 'prod-6', 'noah.jam***@gmail.com', 'GglNew1!', 'T5Y6 U7I8', 'available'),
('l10', 'prod-7', 'olivia.bro***@gmail.com', 'TikAge1!', 'O1P2 A3S4', 'available'),
('l11', 'prod-8', 'liam.joh***@gmail.com', 'SnapNew1!', 'D5F6 G7H8', 'available'),
('l12', 'prod-1', 'ava.dav***@gmail.com', 'Pass012!', 'J9K0 L1M2', 'available')
ON CONFLICT DO NOTHING;

-- Seed media buyers
INSERT INTO media_buyers (id, name, email, avatar, speciality, platforms, experience, spent, rate, rating, reviews, orders, status, joined, portfolio) VALUES
(1, 'Alex Morgan', 'alex@mediapro.com', 'AM', 'Meta Ads Expert', '["Meta","Google"]', '5 years', '$2.4M+', 350, 4.9, 128, 156, 'approved', 'May 1, 2024', 'https://alexmorgan.media'),
(2, 'Sarah Johnson', 'sarah@adspro.com', 'SJ', 'Google Ads Specialist', '["Google"]', '4 years', '$1.8M+', 320, 4.8, 96, 112, 'approved', 'Apr 15, 2024', 'https://sarahjohnson.ads'),
(3, 'David Lee', 'david@tiktokads.io', 'DL', 'TikTok Ads Expert', '["TikTok"]', '3 years', '$1.2M+', 300, 4.7, 0, 0, 'pending', 'May 20, 2024', 'https://davidlee.io'),
(4, 'Emily Carter', 'emily@fullads.com', 'EC', 'Snapchat Ads Expert', '["Snapchat","Meta"]', '6 years', '$950K+', 280, 4.9, 0, 0, 'pending', 'May 22, 2024', 'https://emilycarter.ads'),
(5, 'Michael Brown', 'mike@adscale.com', 'MB', 'Meta & TikTok Expert', '["Meta","TikTok"]', '4 years', '$1.6M+', 400, 4.6, 58, 84, 'approved', 'Mar 10, 2024', 'https://mikebrown.media'),
(6, 'James Wilson', 'james@googleads.pro', 'JW', 'Google & YouTube Ads', '["Google"]', '2 years', '$780K+', 250, 0, 0, 0, 'rejected', 'May 18, 2024', 'https://jameswilson.pro'),
(7, 'Daniel Sanchez', 'daniel@tikpro.io', 'DS', 'TikTok & Meta Expert', '["TikTok","Meta"]', '3 years', '$1.1M+', 330, 0, 0, 0, 'pending', 'May 25, 2024', 'https://danielsanchez.io'),
(8, 'Sophia Martinez', 'sophia@fullfunnel.co', 'SM', 'Full Funnel Specialist', '["Meta","Google","TikTok"]', '7 years', '$2.2M+', 450, 4.8, 91, 131, 'approved', 'Feb 5, 2024', 'https://sophiamartinez.co')
ON CONFLICT DO NOTHING;

-- Update rejected buyer with reason
UPDATE media_buyers SET reject_reason = 'Insufficient portfolio documentation' WHERE id = 6;

-- Seed deposits
INSERT INTO deposits (id, user_id, method, amount, status, date, proof) VALUES
('DEP-001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Payoneer', 350, 'pending', 'May 19, 2024 10:30 AM', 'proof_001.png'),
('DEP-002', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Bank Transfer', 500, 'completed', 'May 18, 2024 09:00 AM', 'proof_002.pdf'),
('DEP-003', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'USDT (TRC20)', 200, 'pending', 'May 17, 2024 02:30 PM', 'proof_003.png'),
('DEP-004', 'd4e5f6a7-b8c9-0123-def1-234567890123', 'Wise', 1000, 'completed', 'May 16, 2024 11:00 AM', 'proof_004.jpg'),
('DEP-005', 'f6a7b8c9-d0e1-2345-f123-456789012345', 'Binance', 150, 'pending', 'May 15, 2024 04:15 PM', 'proof_005.png')
ON CONFLICT DO NOTHING;

-- Seed orders
INSERT INTO orders (id, user_id, type, platform, item, amount, status, date) VALUES
('ORD-98765', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ad Account', 'Meta', 'Meta Ad Account', 120, 'completed', 'May 25, 2024'),
('ORD-98764', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Pre-Verified Account', 'Google', 'Google Aged Account', 150, 'completed', 'May 25, 2024'),
('ORD-98763', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Ad Account', 'TikTok', 'TikTok Ad Account', 100, 'processing', 'May 25, 2024'),
('ORD-98762', 'd4e5f6a7-b8c9-0123-def1-234567890123', 'Ad Account', 'Snapchat', 'Snapchat Ad Account', 90, 'pending', 'May 25, 2024'),
('ORD-98761', 'f6a7b8c9-d0e1-2345-f123-456789012345', 'Pre-Verified Account', 'Meta', 'Meta Aged Account', 110, 'completed', 'May 25, 2024')
ON CONFLICT DO NOTHING;

-- Seed payment methods
INSERT INTO payment_methods (id, name, account, active) VALUES
('pm-1', 'Payoneer', 'adver@solution.com', true),
('pm-2', 'Wise', 'adver@solution.com', true),
('pm-3', 'USDC (TRC20)', 'TY8c...b3fD', true),
('pm-4', 'Binance', '456789852', true),
('pm-5', 'Bank Transfer', 'XXXX XXXX XXXX 1234', true),
('pm-6', 'Local Moroccan Banks', 'Contact support', true),
('pm-7', 'Other', 'Contact support', true)
ON CONFLICT DO NOTHING;

-- Seed business types
INSERT INTO business_types (name) VALUES
('Marketing Agency'), ('E-Commerce Brand'), ('Freelancer'), ('Startup'), ('Enterprise'), ('Other')
ON CONFLICT DO NOTHING;

-- Seed platform prices
INSERT INTO platform_prices (id, price, fee, min_topup, active) VALUES
('meta',     50, 6, 200, true),
('google',   50, 6, 200, true),
('tiktok',   50, 6, 200, true),
('snapchat', 50, 6, 200, true)
ON CONFLICT DO NOTHING;

-- Seed announcements
INSERT INTO announcements (icon, title, body, date) VALUES
('📢', 'New: TikTok Ads Accounts', 'TikTok accounts are now available!', 'May 20, 2024'),
('🛡️', 'System Update', 'Updated security measures for better protection.', 'May 18, 2024'),
('🎁', 'Special Offer', 'Get 10% bonus on your next top up over $500!', 'May 15, 2024')
ON CONFLICT DO NOTHING;

-- ========================
-- RLS POLICIES
-- ========================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_account_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all platform_prices" ON platform_prices FOR ALL USING (true) WITH CHECK (true);

-- Public read access for inventory products, approved media buyers, payment methods, business types, announcements
CREATE POLICY "Public read inventory products" ON inventory_products FOR SELECT USING (true);
CREATE POLICY "Public read media buyers" ON media_buyers FOR SELECT USING (true);
CREATE POLICY "Public read payment methods" ON payment_methods FOR SELECT USING (true);
CREATE POLICY "Public read business types" ON business_types FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read policy_categories" ON policy_categories FOR SELECT USING (true);
CREATE POLICY "Public read policy_translations" ON policy_translations FOR SELECT USING (true);

-- Users: allow all operations (application-level auth check)
CREATE POLICY "Allow all users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all ad_account_requests" ON ad_account_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all inventory_lines" ON inventory_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all deposits" ON deposits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all policy_categories" ON policy_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all policy_translations" ON policy_translations FOR ALL USING (true) WITH CHECK (true);

-- ========================
-- ROLE GRANTS
-- Required for PostgREST (Supabase REST API) to access tables.
-- RLS policies alone are not enough — the PostgreSQL roles also need
-- schema USAGE and table-level privileges.
-- ========================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure future tables created by migrations also get these grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
