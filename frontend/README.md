# GJXpress Frontend

广骏供应链服务（GJXpress）前端应用 - 基于 Next.js App Router 构建的跨境物流信息服务平台。

## 技术栈

- **框架**: Next.js 16.2.4 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **UI组件**: Lucide Icons
- **部署**: Vercel

## 项目结构

```
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/          # 公开页面路由组
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── services/      # 服务介绍页面
│   │   │   ├── how-it-works/  # 使用流程
│   │   │   ├── contact/       # 联系我们
│   │   │   ├── about/         # 关于我们
│   │   │   ├── recommendations/  # 推荐列表和详情
│   │   │   ├── cities/        # 城市筛选页面
│   │   │   └── categories/    # 分类筛选页面
│   │   ├── (admin)/           # 管理后台路由组
│   │   │   ├── admin/
│   │   │   │   ├── login/     # 登录页面
│   │   │   │   ├── dashboard/ # 管理概览
│   │   │   │   ├── orders/    # 订单管理
│   │   │   │   ├── packages/  # 包裹管理
│   │   │   │   ├── exceptions/# 异常处理
│   │   │   │   └── logs/      # 操作日志
│   │   ├── sitemap.ts         # 站点地图
│   │   ├── robots.ts          # 搜索引擎爬虫配置
│   │   ├── layout.tsx         # 根布局
│   │   ├── not-found.tsx      # 404页面
│   │   └── globals.css        # 全局样式
│   ├── components/
│   │   ├── layout/            # 布局组件
│   │   │   ├── SiteHeader.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   └── AdminSidebar.tsx
│   │   ├── common/            # 通用组件
│   │   │   ├── LoadingState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts      # 公开API客户端
│   │   │   └── admin.ts       # 管理员API客户端
│   │   ├── constants/
│   │   │   ├── status.ts      # 状态标签映射
│   │   │   └── index.ts       # 站点配置
│   │   └── utils.ts           # 工具函数
│   └── types/                 # TypeScript类型定义
├── docs/                      # 项目文档
├── public/                    # 静态资源
├── .env                       # 环境变量
├── next.config.ts             # Next.js配置
└── package.json
```

## 环境变量

创建 `.env.local` 文件（本地开发）或在 Vercel 环境变量中配置：

```env
# 必需
NEXT_PUBLIC_API_BASE_URL=https://api.gjxpress.net    # 后端API地址
NEXT_PUBLIC_SITE_URL=https://gjxpress.net            # 站点域名

# 可选（用于SEO和品牌）
NEXT_PUBLIC_BRAND_NAME=广骏供应链服务
NEXT_PUBLIC_BRAND_DISPLAY_NAME=广骏国际快运
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 代码规范

```bash
# ESLint检查
npm run lint

# Prettier格式化
npx prettier --write src/
```

### 构建

```bash
npm run build
```

## 路由说明

### 公开页面 (Server Components, SEO优化)

- `/` - 首页
- `/services` - 服务介绍
- `/services/china-us-shipping` - 中美跨境物流
- `/services/air-freight` - 空运服务
- `/services/sea-freight` - 海运服务
- `/how-it-works` - 使用流程
- `/contact` - 联系我们
- `/about` - 关于我们
- `/recommendations` - 推荐列表
- `/recommendations/[slug]` - 推荐详情
- `/cities/[city]` - 城市筛选
- `/categories/[category]` - 分类筛选

### 管理后台 (Client Components)

- `/admin/login` - 管理员登录
- `/admin/dashboard` - 管理概览
- `/admin/orders` - 订单列表
- `/admin/orders/[id]` - 订单详情
- `/admin/packages` - 包裹列表
- `/admin/packages/inbound` - 包裹入库
- `/admin/exceptions` - 异常列表
- `/admin/exceptions/[id]` - 异常处理
- `/admin/logs` - 操作日志

## SEO特性

- **Sitemap**: 自动生成 `/sitemap.xml`
- **Robots**: 配置 `/robots.txt`，禁止爬虫访问 `/admin/*`
- **Metadata**: 每个页面都有独立的 title 和 description
- **Open Graph**: 社交媒体分享优化
- **Canonical URLs**: 规范化链接

## API设计

### 前端只调用 `NEXT_PUBLIC_API_BASE_URL`

- 不直接调用 Supabase
- 不暴露后端密钥
- Admin API 使用 JWT 认证，存储在 localStorage

### API客户端结构

```typescript
// 公开API (无需认证)
import { publicApi } from '@/lib/api/client';
publicApi.getRecommendations();

// 管理员API (需要JWT)
import { adminApi, adminAuth } from '@/lib/api/admin';
adminAuth.login(username, password);
adminApi.getOrders();
```

## Vercel 部署

### 方式一：GitHub集成（推荐）

1. 将代码推送到 GitHub 仓库
2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "Add New Project"
4. 导入 GitHub 仓库
5. 配置环境变量（见上文）
6. 点击 "Deploy"

### 方式二：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 环境变量配置

在 Vercel Dashboard 中设置：

1. 进入项目设置 → Environment Variables
2. 添加以下变量：
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_BRAND_NAME`
   - `NEXT_PUBLIC_BRAND_DISPLAY_NAME`

### 自定义域名

1. Vercel Dashboard → 项目 → Settings → Domains
2. 添加你的域名（如 `gjxpress.net`）
3. 按照提示配置 DNS 记录

### 构建优化

项目已配置为静态导出（Static Export），适合 SEO：

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  distDir: 'dist',
};
```

## 注意事项

1. **不实现微信小程序页面** - 微信小程序是独立项目
2. **不实现微信支付** - 支付逻辑在后端处理
3. **SEO页面使用 Server Components** - 保持静态渲染
4. **Admin页面使用 Client Components** - 支持交互功能

## 开发约定

- 所有公开页面使用 Server Components 以获得最佳 SEO
- Admin 页面使用 `'use client'` 指令
- API 调用统一使用 `lib/api/` 下的客户端
- 状态标签使用 `StatusBadge` 组件统一展示
- 加载/空状态/错误状态使用对应的通用组件

## 相关文档

- [docs/prd.md](./docs/prd.md) - 产品需求文档
- [docs/architecture.md](./docs/architecture.md) - 架构文档
- [docs/api_contract.md](./docs/api_contract.md) - API 契约
- [docs/seo.md](./docs/seo.md) - SEO 策略
- [docs/pages.md](./docs/pages.md) - 页面规范
