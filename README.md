# 月计划管理网站

一个基于React + Supabase的个人月计划管理网站，支持月历视图和计划管理功能。

## 功能特点

- 📅 **月历视图**：直观的月历界面，显示每月计划分布
- ✅ **计划管理**：添加、编辑、删除、标记完成状态
- 📱 **响应式设计**：适配桌面端和移动端
- 💾 **数据存储**：支持Supabase云端存储和本地存储
- 🎨 **现代化UI**：简洁美观的用户界面

## 技术栈

- **前端**：React 18 + Vite + Tailwind CSS
- **后端**：Supabase (PostgreSQL + 认证 + 实时功能)
- **图标**：Lucide React
- **日期处理**：date-fns

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

复制 `.env.example` 为 `.env` 并填写你的Supabase配置：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

如果不配置Supabase，系统会自动使用本地存储。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 4. 构建生产版本

```bash
npm run build
```

## Supabase配置

### 数据库表结构

```sql
-- 计划表
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    plan_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_plans_plan_date ON plans(plan_date);

-- 授权访问
GRANT SELECT ON plans TO anon;
GRANT ALL ON plans TO authenticated;
```

## 使用说明

1. **查看计划**：点击月历中的任意日期查看该日计划
2. **添加计划**：在右侧计划列表底部输入框中添加新计划
3. **编辑计划**：点击计划文本进入编辑模式
4. **删除计划**：点击计划右侧的删除按钮
5. **标记完成**：点击计划前的复选框标记完成状态
6. **切换月份**：使用顶部的月份导航切换不同月份

## 开发说明

### 项目结构

```
src/
├── components/          # React组件
│   ├── Calendar.jsx    # 月历组件
│   ├── PlanList.jsx    # 计划列表组件
│   └── MonthNavigation.jsx  # 月份导航组件
├── lib/                # 工具库
│   ├── api.js         # API接口
│   ├── supabase.js    # Supabase配置
│   └── storage.js     # 本地存储工具
├── App.jsx            # 主应用组件
├── main.jsx           # 应用入口
└── index.css          # 全局样式
```

### 组件说明

- **Calendar**：显示月历，支持日期选择和计划指示
- **PlanList**：显示计划列表，支持CRUD操作
- **MonthNavigation**：月份切换和今天按钮
- **App**：主应用组件，协调各组件状态

## 部署

### 部署到Vercel

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 部署

### 部署到Netlify

1. 构建项目：`npm run build`
2. 将 `dist` 目录部署到Netlify
3. 配置环境变量

## 许可证

MIT License