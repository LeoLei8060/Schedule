-- 用户认证功能数据库更新脚本
-- 此脚本用于添加用户认证相关的表结构和权限设置

-- 1. 更新现有的 plans 表，添加 user_id 字段（如果尚不存在）
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 更新现有的 plans 表索引
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_date ON plans(user_id, plan_date);

-- 3. 更新现有的 public_plans 表，添加 session_id 字段（如果尚不存在）
ALTER TABLE public_plans 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- 4. 更新现有的 public_plans 表索引
CREATE INDEX IF NOT EXISTS idx_public_plans_session_id ON public_plans(session_id);
CREATE INDEX IF NOT EXISTS idx_public_plans_session_date ON public_plans(session_id, plan_date);

-- 5. 启用行级安全策略（RLS）
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_plans ENABLE ROW LEVEL SECURITY;

-- 6. 为 plans 表创建 RLS 策略
-- 用户只能查看、更新、删除自己的计划
DROP POLICY IF EXISTS "Users can view own plans" ON plans;
CREATE POLICY "Users can view own plans" ON plans
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own plans" ON plans;
CREATE POLICY "Users can insert own plans" ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own plans" ON plans;
CREATE POLICY "Users can update own plans" ON plans
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own plans" ON plans;
CREATE POLICY "Users can delete own plans" ON plans
  FOR DELETE USING (auth.uid() = user_id);

-- 7. 为 public_plans 表创建 RLS 策略（匿名用户）
-- 匿名用户只能查看、更新、删除自己会话的计划
DROP POLICY IF EXISTS "Anonymous users can view own plans" ON public_plans;
CREATE POLICY "Anonymous users can view own plans" ON public_plans
  FOR SELECT USING (
    auth.uid() IS NULL AND 
    session_id = current_setting('app.session_id', true)
  );

DROP POLICY IF EXISTS "Anonymous users can insert own plans" ON public_plans;
CREATE POLICY "Anonymous users can insert own plans" ON public_plans
  FOR INSERT WITH CHECK (
    auth.uid() IS NULL AND 
    session_id = current_setting('app.session_id', true)
  );

DROP POLICY IF EXISTS "Anonymous users can update own plans" ON public_plans;
CREATE POLICY "Anonymous users can update own plans" ON public_plans
  FOR UPDATE USING (
    auth.uid() IS NULL AND 
    session_id = current_setting('app.session_id', true)
  );

DROP POLICY IF EXISTS "Anonymous users can delete own plans" ON public_plans;
CREATE POLICY "Anonymous users can delete own plans" ON public_plans
  FOR DELETE USING (
    auth.uid() IS NULL AND 
    session_id = current_setting('app.session_id', true)
  );

-- 8. 更新权限设置
-- 为认证用户授予完整权限
GRANT ALL ON plans TO authenticated;
GRANT ALL ON public_plans TO authenticated;

-- 为匿名用户授予基本权限
GRANT SELECT ON plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public_plans TO anon;

-- 9. 创建用户资料表（可选，用于存储额外用户信息）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 为用户资料表启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 11. 为用户资料表创建 RLS 策略
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 12. 为用户资料表创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 13. 创建触发器函数，用于自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. 为用户资料表创建触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 15. 创建函数，用于迁移匿名数据到注册用户
CREATE OR REPLACE FUNCTION migrate_anonymous_to_user(target_user_id UUID, source_session_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
BEGIN
  -- 迁移 public_plans 到 plans
  INSERT INTO plans (content, plan_date, completed, user_id, created_at, updated_at)
  SELECT content, plan_date, completed, target_user_id, created_at, updated_at
  FROM public_plans
  WHERE session_id = source_session_id;
  
  GET DIAGNOSTICS migrated_count = ROW_COUNT;
  
  -- 删除已迁移的匿名数据
  DELETE FROM public_plans WHERE session_id = source_session_id;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. 创建函数，用于清理过期的匿名数据（可选）
CREATE OR REPLACE FUNCTION cleanup_expired_anonymous_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- 删除30天前的匿名数据
  DELETE FROM public_plans
  WHERE session_id IS NOT NULL
    AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. 为用户资料表授予权限
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

-- 18. 为 auth.users 表创建 RLS 策略（如果需要）
-- 注意：通常不建议直接操作 auth.users 表，应通过 Supabase Auth API 管理用户

-- 19. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_plans_date_user ON plans(plan_date, user_id);
CREATE INDEX IF NOT EXISTS idx_public_plans_date_session ON public_plans(plan_date, session_id);

-- 20. 创建函数，用于获取用户统计信息
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (
  total_plans BIGINT,
  completed_plans BIGINT,
  month_plans BIGINT,
  completion_rate INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_plans,
    COUNT(*) FILTER (WHERE completed = true)::BIGINT as completed_plans,
    COUNT(*) FILTER (WHERE plan_date >= DATE_TRUNC('month', CURRENT_DATE))::BIGINT as month_plans,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE completed = true) * 100.0 / COUNT(*)))::INTEGER
    END as completion_rate
  FROM plans
  WHERE plans.user_id = get_user_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 21. 授予函数执行权限
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;