-- 月计划管理网站数据库结构

-- 创建计划表
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    plan_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_plans_plan_date ON plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans(created_at DESC);

-- 授权访问权限
GRANT SELECT ON plans TO anon;
GRANT ALL ON plans TO authenticated;

-- 创建公共计划表（用于匿名用户）
CREATE TABLE IF NOT EXISTS public_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    plan_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建公共计划表索引
CREATE INDEX IF NOT EXISTS idx_public_plans_plan_date ON public_plans(plan_date);
CREATE INDEX IF NOT EXISTS idx_public_plans_session_id ON public_plans(session_id);

-- 授权公共计划表访问
GRANT ALL ON public_plans TO anon;
GRANT ALL ON public_plans TO authenticated;

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为计划表创建触发器
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为公共计划表创建触发器
DROP TRIGGER IF EXISTS update_public_plans_updated_at ON public_plans;
CREATE TRIGGER update_public_plans_updated_at
    BEFORE UPDATE ON public_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO plans (content, plan_date, completed) VALUES
    ('完成项目文档编写', '2024-01-15', false),
    ('团队会议', '2024-01-15', true),
    ('代码审查', '2024-01-16', false),
    ('客户需求讨论', '2024-01-17', false),
    ('系统测试', '2024-01-18', false);