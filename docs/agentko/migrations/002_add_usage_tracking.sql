-- Migration: Add Usage Tracking
-- Description: Adds token usage tracking and monthly aggregation
-- Date: 2025-11-16
-- Version: 002

-- Create token_usage table for detailed tracking
CREATE TABLE IF NOT EXISTS token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  message_id UUID,
  model VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_token_usage_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT ck_token_usage_tokens_positive
    CHECK (prompt_tokens >= 0 AND completion_tokens >= 0 AND total_tokens >= 0)
);

-- Create monthly_usage_summary for aggregated data
CREATE TABLE IF NOT EXISTS monthly_usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_cost_usd DECIMAL(10, 4),
  models_used JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_monthly_usage_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT ck_monthly_usage_year
    CHECK (year >= 2024 AND year <= 2100),
  CONSTRAINT ck_monthly_usage_month
    CHECK (month >= 1 AND month <= 12),
  CONSTRAINT uq_monthly_usage_user_period
    UNIQUE(user_id, year, month)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_created
  ON token_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_usage_session ON token_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_model ON token_usage(model);

CREATE INDEX IF NOT EXISTS idx_monthly_summary_user_id ON monthly_usage_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_period ON monthly_usage_summary(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_user_period
  ON monthly_usage_summary(user_id, year, month);

-- Function to update monthly summary
CREATE OR REPLACE FUNCTION update_monthly_usage_summary()
RETURNS TRIGGER AS $$
DECLARE
  v_year INTEGER;
  v_month INTEGER;
  v_models JSONB;
BEGIN
  -- Extract year and month from created_at
  v_year := EXTRACT(YEAR FROM NEW.created_at);
  v_month := EXTRACT(MONTH FROM NEW.created_at);

  -- Get current models_used or initialize empty object
  SELECT models_used INTO v_models
  FROM monthly_usage_summary
  WHERE user_id = NEW.user_id
    AND year = v_year
    AND month = v_month;

  IF v_models IS NULL THEN
    v_models := '{}'::JSONB;
  END IF;

  -- Update model count
  v_models := jsonb_set(
    v_models,
    ARRAY[NEW.model],
    to_jsonb(COALESCE((v_models->NEW.model)::INTEGER, 0) + 1)
  );

  -- Insert or update monthly summary
  INSERT INTO monthly_usage_summary (
    user_id,
    year,
    month,
    total_tokens,
    total_requests,
    total_cost_usd,
    models_used
  )
  VALUES (
    NEW.user_id,
    v_year,
    v_month,
    NEW.total_tokens,
    1,
    NEW.cost_usd,
    v_models
  )
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET
    total_tokens = monthly_usage_summary.total_tokens + NEW.total_tokens,
    total_requests = monthly_usage_summary.total_requests + 1,
    total_cost_usd = COALESCE(monthly_usage_summary.total_cost_usd, 0) + COALESCE(NEW.cost_usd, 0),
    models_used = v_models,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update monthly summary on new token usage
CREATE TRIGGER trigger_update_monthly_summary
  AFTER INSERT ON token_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_usage_summary();

-- Function to get current month usage for a user
CREATE OR REPLACE FUNCTION get_current_month_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_usage INTEGER;
BEGIN
  SELECT COALESCE(total_tokens, 0) INTO v_usage
  FROM monthly_usage_summary
  WHERE user_id = p_user_id
    AND year = EXTRACT(YEAR FROM NOW())
    AND month = EXTRACT(MONTH FROM NOW());

  RETURN COALESCE(v_usage, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can make request
CREATE OR REPLACE FUNCTION check_user_quota(
  p_user_id UUID,
  p_estimated_tokens INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_usage INTEGER,
  limit INTEGER,
  remaining INTEGER,
  percentage NUMERIC
) AS $$
DECLARE
  v_tier VARCHAR(20);
  v_limit INTEGER;
  v_usage INTEGER;
BEGIN
  -- Get user tier
  SELECT tier INTO v_tier FROM users WHERE id = p_user_id;

  -- Get tier limit
  v_limit := CASE v_tier
    WHEN 'free' THEN 50000
    WHEN 'basic' THEN 500000
    WHEN 'pro' THEN 2000000
    ELSE 0
  END;

  -- Get current usage
  v_usage := get_current_month_usage(p_user_id);

  -- Return quota status
  RETURN QUERY SELECT
    (v_usage + p_estimated_tokens) <= v_limit AS allowed,
    v_usage AS current_usage,
    v_limit AS limit,
    GREATEST(0, v_limit - v_usage) AS remaining,
    ROUND((v_usage::NUMERIC / NULLIF(v_limit, 0)) * 100, 2) AS percentage;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for usage analytics (refreshed daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS usage_analytics AS
SELECT
  DATE_TRUNC('day', tu.created_at) as date,
  u.tier,
  COUNT(DISTINCT tu.user_id) as active_users,
  SUM(tu.total_tokens) as total_tokens,
  COUNT(*) as total_requests,
  SUM(tu.cost_usd) as total_cost,
  AVG(tu.total_tokens) as avg_tokens_per_request
FROM token_usage tu
JOIN users u ON u.id = tu.user_id
GROUP BY DATE_TRUNC('day', tu.created_at), u.tier
ORDER BY date DESC;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_usage_analytics_date ON usage_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_tier ON usage_analytics(tier);

-- Create view for user usage overview
CREATE OR REPLACE VIEW user_usage_overview AS
SELECT
  u.id as user_id,
  u.email,
  u.tier,
  mus.year,
  mus.month,
  mus.total_tokens,
  mus.total_requests,
  mus.total_cost_usd,
  mus.models_used,
  CASE u.tier
    WHEN 'free' THEN 50000
    WHEN 'basic' THEN 500000
    WHEN 'pro' THEN 2000000
    ELSE 0
  END as monthly_limit,
  ROUND((mus.total_tokens::NUMERIC / CASE u.tier
    WHEN 'free' THEN 50000
    WHEN 'basic' THEN 500000
    WHEN 'pro' THEN 2000000
    ELSE 1
  END) * 100, 2) as usage_percentage
FROM users u
LEFT JOIN monthly_usage_summary mus ON mus.user_id = u.id
  AND mus.year = EXTRACT(YEAR FROM NOW())
  AND mus.month = EXTRACT(MONTH FROM NOW())
WHERE u.status = 'active';

-- Create view for users approaching quota
CREATE OR REPLACE VIEW users_approaching_quota AS
SELECT
  uuo.*,
  CASE
    WHEN uuo.usage_percentage >= 100 THEN 'exceeded'
    WHEN uuo.usage_percentage >= 80 THEN 'warning'
    ELSE 'ok'
  END as quota_status
FROM user_usage_overview uuo
WHERE uuo.usage_percentage >= 80
ORDER BY uuo.usage_percentage DESC;

-- Daily usage statistics view
CREATE OR REPLACE VIEW daily_usage_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users,
  SUM(total_tokens) as total_tokens,
  COUNT(*) as total_requests,
  SUM(cost_usd) as total_cost,
  AVG(total_tokens) as avg_tokens_per_request,
  MAX(total_tokens) as max_tokens_in_request
FROM token_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Add comments for documentation
COMMENT ON TABLE token_usage IS 'Detailed token usage tracking for every LLM request';
COMMENT ON TABLE monthly_usage_summary IS 'Aggregated monthly usage per user for performance';
COMMENT ON FUNCTION get_current_month_usage IS 'Returns total tokens used by user in current month';
COMMENT ON FUNCTION check_user_quota IS 'Checks if user has quota available for estimated token usage';
COMMENT ON MATERIALIZED VIEW usage_analytics IS 'Daily usage analytics by tier. Refresh daily with: REFRESH MATERIALIZED VIEW usage_analytics';

-- Create job to refresh materialized view (requires pg_cron extension)
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('refresh-usage-analytics', '0 1 * * *',
--   'REFRESH MATERIALIZED VIEW usage_analytics');

-- Migration complete
SELECT 'Migration 002: Usage tracking added successfully' as status;
