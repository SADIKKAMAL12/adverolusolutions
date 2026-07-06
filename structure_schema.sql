-- =====================================================
-- AdverSolutions / Filterfy — Agency Structure Builder
-- MySQL Schema
-- =====================================================

-- -----------------------------------------------------
-- Table: structure_assets
-- Predefined node types with pricing & theming
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS structure_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  icon VARCHAR(50) DEFAULT 'box',
  glow_color VARCHAR(20) DEFAULT '#3b82f6',
  bg_color_dark VARCHAR(20) DEFAULT '#1a1a2e',
  bg_color_light VARCHAR(20) DEFAULT '#ffffff',
  border_color_dark VARCHAR(20) DEFAULT '#3d3d5c',
  border_color_light VARCHAR(20) DEFAULT '#e5e7eb',
  text_color_dark VARCHAR(20) DEFAULT '#f0f0fa',
  text_color_light VARCHAR(20) DEFAULT '#1f2937',
  description TEXT,
  sort_order INT DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: structure_connections
-- Predefined edge / connection types
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS structure_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  edge_color VARCHAR(20) DEFAULT '#6b7280',
  dash_array VARCHAR(20) DEFAULT NULL,
  animated TINYINT(1) DEFAULT 0,
  description TEXT,
  sort_order INT DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: structure_drafts
-- User-saved builder drafts
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS structure_drafts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Untitled Structure',
  nodes_json LONGTEXT NOT NULL,
  edges_json LONGTEXT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  node_count INT NOT NULL DEFAULT 0,
  edge_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: structure_orders
-- Submitted structure orders (user → admin)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS structure_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  draft_id INT NULL,
  order_code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL DEFAULT 'Structure Order',
  nodes_json LONGTEXT NOT NULL,
  edges_json LONGTEXT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  node_count INT NOT NULL DEFAULT 0,
  edge_count INT NOT NULL DEFAULT 0,
  status ENUM('pending','building','done','rejected','assets_missing') NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at),
  FOREIGN KEY (draft_id) REFERENCES structure_drafts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Seed Data: Structure Assets (Pricing)
-- -----------------------------------------------------
INSERT INTO structure_assets (`key`, label, base_price, icon, glow_color, bg_color_dark, bg_color_light, border_color_dark, border_color_light, text_color_dark, text_color_light, description, sort_order, active) VALUES
('profile',           'Profile',            40.00,  'user',           '#3b82f6', '#0f1a2e', '#eff6ff', '#1e3a5f', '#bfdbfe', '#dbeafe', '#1e40af', 'Individual Facebook profile used as foundation.', 1, 1),
('bm_verified',       'BM Verified',        250.00, 'shield-check',   '#10b981', '#0a1f15', '#ecfdf5', '#14532d', '#a7f3d0', '#d1fae5', '#065f46', 'Verified Business Manager with full features.', 2, 1),
('agency_bm',         'Agency BM',          300.00, 'building-2',     '#8b5cf6', '#1a1033', '#f5f3ff', '#4c1d95', '#ddd6fe', '#ede9fe', '#5b21b6', 'Agency-level Business Manager for multiple clients.', 3, 1),
('advertiser_account','Advertiser Account',  60.00, 'megaphone',      '#f59e0b', '#271a05', '#fffbeb', '#78350f', '#fde68a', '#fef3c7', '#92400e', 'Dedicated advertiser account for campaigns.', 4, 1),
('client_ad_account', 'Client Ad Account',  60.00, 'briefcase',      '#06b6d4', '#0a1f24', '#ecfeff', '#155e75', '#a5f3fc', '#cffafe', '#0e7490', 'Client-managed ad account under agency BM.', 5, 1),
('pages_bm',          'Pages BM',           80.00,  'file-stack',     '#ec4899', '#2a0a1a', '#fdf2f8', '#831843', '#fbcfe8', '#fce7f3', '#9d174d', 'Business Manager with page assets bundled.', 6, 1),
('fan_page',          'Fan Page',           35.00,  'heart',          '#ef4444', '#2a0a0a', '#fef2f2', '#7f1d1d', '#fecaca', '#fee2e2', '#991b1b', 'Facebook fan page with established following.', 7, 1),
('pixel',             'Pixel',              25.00,  'activity',       '#14b8a6', '#0a1f1c', '#f0fdfa', '#134e4a', '#99f6e4', '#ccfbf1', '#115e59', 'Facebook Pixel for tracking and retargeting.', 8, 1),
('dataset',           'Dataset',            20.00,  'database',       '#6366f1', '#0f0a2e', '#eef2ff', '#312e81', '#c7d2fe', '#e0e7ff', '#3730a3', 'Conversions API dataset for server-side events.', 9, 1),
('domain',            'Domain',             30.00,  'globe',          '#f97316', '#271306', '#fff7ed', '#7c2d12', '#fed7aa', '#ffedd5', '#9a3412', 'Verified domain for event tracking and ads.', 10, 1),
('backup_admin',      'Backup Admin',       25.00,  'users',          '#84cc16', '#1a2405', '#f7fee7', '#3f6212', '#d9f99d', '#ecfccb', '#4d7c0f', 'Backup administrator access for redundancy.', 11, 1),
('employee',          'Employee',           15.00,  'user-cog',       '#64748b', '#0f172a', '#f8fafc', '#334155', '#cbd5e1', '#e2e8f0', '#475569', 'Employee access with limited permissions.', 12, 1),
('media_buyer',       'Media Buyer',        45.00,  'trending-up',    '#d946ef', '#2a0a2a', '#fdf4ff', '#86198f', '#f0abfc', '#fae8ff', '#a21caf', 'Vetted media buyer with proven track record.', 13, 1)
ON DUPLICATE KEY UPDATE
  label=VALUES(label), base_price=VALUES(base_price), icon=VALUES(icon), glow_color=VALUES(glow_color);

-- -----------------------------------------------------
-- Seed Data: Structure Connections
-- -----------------------------------------------------
INSERT INTO structure_connections (`key`, label, edge_color, dash_array, animated, description, sort_order, active) VALUES
('admin',            'Admin',              '#ef4444', NULL,      0, 'Full administrative control over the connected asset.', 1, 1),
('partner',          'Partner',            '#3b82f6', NULL,      0, 'Partner access with shared asset management.', 2, 1),
('advertiser_access','Advertiser Access',  '#f59e0b', '5,5',     1, 'Limited advertiser access for campaign management.', 3, 1),
('employee',         'Employee',           '#10b981', '2,4',     0, 'Employee-level access within the organization.', 4, 1),
('pixel_sharing',    'Pixel Sharing',      '#8b5cf6', '8,4,2,4', 1, 'Shared pixel data between connected assets.', 5, 1),
('domain_sharing',   'Domain Sharing',     '#06b6d4', '4,4',     0, 'Shared verified domain across accounts.', 6, 1)
ON DUPLICATE KEY UPDATE
  label=VALUES(label), edge_color=VALUES(edge_color), dash_array=VALUES(dash_array), animated=VALUES(animated);
