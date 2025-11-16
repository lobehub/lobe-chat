-- Migration: Add Tier System to Users
-- Description: Adds tier management and approval workflow to users table
-- Date: 2025-11-16
-- Version: 001

-- Add columns to users table for tier system
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending_approval';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Add foreign key constraint for approved_by
ALTER TABLE users ADD CONSTRAINT fk_users_approved_by
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  monthly_token_limit INTEGER NOT NULL,
  assigned_by UUID,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_subscription_tiers_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subscription_tiers_assigned_by
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT ck_subscription_tiers_tier
    CHECK (tier IN ('free', 'basic', 'pro')),
  CONSTRAINT ck_subscription_tiers_status
    CHECK (status IN ('active', 'expired', 'cancelled'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_user_id ON subscription_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_status ON subscription_tiers(status);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active
  ON subscription_tiers(user_id, status)
  WHERE status = 'active';

-- Create admin_actions audit log table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  target_user_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_admin_actions_admin_id
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_admin_actions_target_user_id
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for admin action queries
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_actions(target_user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_tiers_updated_at
  BEFORE UPDATE ON subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for active subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT
  st.*,
  u.email,
  u.name,
  u.status as user_status
FROM subscription_tiers st
JOIN users u ON u.id = st.user_id
WHERE st.status = 'active'
  AND (st.expires_at IS NULL OR st.expires_at > NOW());

-- Create view for pending approvals
CREATE OR REPLACE VIEW pending_approvals AS
SELECT
  u.id,
  u.email,
  u.name,
  u.avatar,
  u.created_at,
  EXTRACT(EPOCH FROM (NOW() - u.created_at))/3600 as hours_waiting
FROM users u
WHERE u.status = 'pending_approval'
ORDER BY u.created_at ASC;

-- Insert default tier configurations (for reference)
COMMENT ON TABLE subscription_tiers IS 'User subscription tiers and history. Current tier limits: free=50k, basic=500k, pro=2M tokens/month';

-- Migration complete
SELECT 'Migration 001: Tier system added successfully' as status;
