# Architecture：GJXpress / 广骏供应链服务

> 文档版本：v1.0
> 当前技术选型：NestJS + Supabase Postgres + Supabase Storage + Prisma + AWS EC2 + Next.js + Vercel + 微信原生小程序

---

## 1. 架构目标

本架构服务于广骏供应链服务的 Logistic OS。目标是用尽可能简单、稳定、可扩展的方式支持以下能力：

- 微信小程序用户查询物流和确认包裹。
- 管理员操作订单、包裹、入库、支付状态、发货和异常。
- 对外 SEO 网站和推荐系统。
- 后端统一处理权限、微信登录、数据访问和图片上传。
- 使用 Supabase Postgres 作为主数据库。
- 使用 Supabase Storage 存储包裹照片。
- 使用 AWS EC2 部署 NestJS API。
- 使用 Vercel 部署 Next.js 外部站点。

架构原则：

1. 后端为唯一可信层。
2. 小程序不直接访问数据库或存储服务。
3. 所有用户身份校验都在后端完成。
4. 管理员关键操作必须可追踪。
5. API contract 统一服务于 frontend 和 miniprogram。
6. 先保证 MVP 上线，再逐步扩展复杂功能。

---

## 2. 代码仓库结构

推荐使用单仓库多应用结构。

```text
gjxpress/
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── api_contract.md
│   ├── roadmap.md
│   └── adr/
│       ├── 0001-use-nestjs.md
│       ├── 0002-use-supabase-postgres.md
│       ├── 0003-use-nextjs-for-seo.md
│       └── 0004-use-wechat-native-miniprogram.md
│
├── backend/
│   ├── docs/
│   ├── prisma/
│   ├── src/
│   ├── Dockerfile
│   ├── docker-compose.local.yml
│   └── package.json
│
├── frontend/
│   ├── docs/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── miniprogram/
│   ├── docs/
│   ├── pages/
│   ├── components/
│   ├── utils/
│   ├── app.js
│   ├── app.json
│   └── project.config.json
│
├── package.json
├── pnpm-workspace.yaml
├── README.md
└── .env.example
```

### 2.1 根目录 docs

根目录文档是全局事实来源，包含：

- 产品总 PRD。
- 架构文档。
- API contract。
- Roadmap。
- 技术决策记录 ADR。

### 2.2 backend/docs

只写后端相关文档：

- 数据模型。
- 模块划分。
- API 实现细节。
- 部署。
- Supabase 连接。
- 微信登录。

### 2.3 frontend/docs

只写外部网站和 Admin UI：

- SEO 页面。
- 推荐系统。
- Admin 页面。
- Vercel 部署。

### 2.4 miniprogram/docs

只写微信小程序：

- 页面结构。
- 微信登录。
- 隐私授权。
- 订阅消息。
- 真机调试。
- 微信审核注意事项。

---

## 3. 高层系统架构

```text
                 ┌──────────────────────┐
                 │    Next.js Frontend   │
                 │  www.gjxpress.io      │
                 │  admin.gjxpress.io    │
                 └──────────┬───────────┘
                            │ HTTPS API
                            ▼
┌──────────────────────┐   ┌──────────────────────┐
│ WeChat Mini Program  │   │    NestJS Backend     │
│ miniprogram          │──▶│ api.gjxpress.io       │
└──────────────────────┘   │ AWS EC2 + Docker      │
                           └──────────┬───────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
   ┌──────────────────┐    ┌──────────────────────┐   ┌─────────────────┐
   │ Supabase Postgres│    │ Supabase Storage     │   │ WeChat API      │
   │ business data    │    │ package images       │   │ code2Session    │
   └──────────────────┘    └──────────────────────┘   │ subscribe msg   │
                                                       └─────────────────┘
```

---

## 4. 技术栈

### 4.1 Backend

- Runtime：Node.js LTS。
- Framework：NestJS。
- Language：TypeScript。
- ORM：Prisma。
- Database：Supabase Postgres。
- Storage：Supabase Storage。
- Deployment：AWS EC2 + Docker。
- Reverse Proxy：Nginx。
- Auth：JWT + 微信 openid。

### 4.2 Frontend

- Framework：Next.js。
- Deployment：Vercel。
- UI：可选 Tailwind CSS / shadcn/ui。
- SEO：Next.js Metadata、SSR/SSG。
- 用途：外部站、推荐系统、Admin 初版。

### 4.3 Miniprogram

- 微信原生小程序。
- 使用 `wx.login`。
- 使用后端 JWT。
- 不直接访问 Supabase。
- 不在小程序内接支付。

### 4.4 Infrastructure

- API Domain：`https://api.gjxpress.io`。
- Website Domain：`https://www.gjxpress.io`。
- Admin Domain：`https://admin.gjxpress.io`，可选。
- Database：Supabase project。
- Storage Bucket：Supabase Storage bucket。
- Backend Host：AWS EC2。

---

## 5. 环境规划

### 5.1 Local

用途：开发和调试。

```text
backend: http://localhost:3000
frontend: http://localhost:3001
miniprogram: WeChat DevTools with local API
postgres: Supabase remote dev 或本地 Docker Postgres
storage: Supabase dev bucket
```

### 5.2 Staging

用途：真机预览、内部测试、微信审核前验证。

```text
api: https://api.gjxpress.io
frontend: https://www.gjxpress.io
admin: https://admin.gjxpress.io 或 /admin
postgres: Supabase project
storage: Supabase bucket
```

### 5.3 Production

MVP 阶段可以先和 staging 使用同一套环境，但配置应预留拆分空间。

---

## 6. 域名规划

```text
api.gjxpress.io       → NestJS backend on AWS EC2
www.gjxpress.io       → Next.js frontend on Vercel
gjxpress.io           → redirect to www.gjxpress.io
admin.gjxpress.io     → Admin UI, optional
assets.gjxpress.io    → optional CDN alias for storage, future
```

微信小程序后台需要配置：

```text
request 合法域名：https://api.gjxpress.io
uploadFile 合法域名：https://api.gjxpress.io
下载域名：https://api.gjxpress.io
```

如果未来图片直接走公开 storage CDN，则需额外配置对应下载域名。

---

## 7. 后端模块划分

NestJS 后端建议模块：

```text
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── dto/
├── prisma/
├── auth/
├── users/
├── admins/
├── orders/
├── packages/
├── inbound/
├── images/
├── exceptions/
├── payments/
├── shipments/
├── logistics/
├── qr/
├── notifications/
├── warehouse-address/
└── health/
```

### 7.1 Auth Module

职责：

- 微信登录。
- Admin 登录。
- JWT 签发和验证。
- token refresh，后续可选。

### 7.2 Users Module

职责：

- 用户资料。
- user_code 生成。
- 当前用户 profile。

### 7.3 Orders Module

职责：

- 订单创建。
- 订单列表。
- 订单详情。
- 订单状态流转。
- 用户权限检查。

### 7.4 Packages Module

职责：

- 包裹创建。
- 入库信息。
- 重量和尺寸。
- 用户确认。
- 异常提交。

### 7.5 Images Module

职责：

- 图片上传授权。
- 图片 metadata 保存。
- 图片访问权限。

### 7.6 Payments Module

职责：

- 支付状态记录。
- 管理员标记已支付。
- 外部支付备注。

### 7.7 Shipments Module

职责：

- 创建国际发货。
- 物流渠道和运单号。
- 发货时间。
- 物流状态。

### 7.8 QR Module

职责：

- 生成二维码 token。
- 扫码校验。
- 本人确认。
- 扫码日志。

### 7.9 Notifications Module

职责：

- 微信订阅消息。
- 通知模板管理。
- 通知发送日志。

### 7.10 AdminActionLog

职责：

- 所有管理员关键操作写日志。
- 保存 before_state、after_state、reason。

---

## 8. 数据架构

### 8.1 主数据库

使用 Supabase Postgres。

原因：

- Postgres 适合订单、包裹、状态、日志等关系型业务。
- Supabase 降低早期运维成本。
- Prisma 可直接连接。
- 后期可迁移到 AWS RDS PostgreSQL。

### 8.2 Prisma

Prisma 用于：

- schema 管理。
- migration。
- type-safe query。
- seed 数据。

要求：

- 每次结构变更必须生成 migration。
- 不在生产环境运行 `prisma migrate dev`。
- 部署使用 `prisma migrate deploy`。
- 运行时使用 pooled connection。
- migration 使用 direct connection。

环境变量示例：

```env
DATABASE_URL="postgresql://...pooled..."
DIRECT_URL="postgresql://...direct..."
```

### 8.3 JSONB 使用原则

Postgres 中可使用 JSONB 存储不稳定数据：

- 第三方物流 API 原始响应。
- AdminActionLog before/after state。
- QR scan metadata。
- Notification payload。

核心业务字段不要全部放 JSONB，仍应建明确字段。

---

## 9. 存储架构

### 9.1 Supabase Storage

用于存储：

- 包裹外包装照片。
- 面单照片。
- 内部物品照片。
- 异常照片。
- 支付凭证图片，可选。

### 9.2 上传流程

推荐 MVP 流程：

```text
Admin UI / Miniprogram
→ 请求 backend 创建上传目标
→ backend 生成上传路径或代传
→ 上传至 Supabase Storage
→ backend 保存 PackageImage metadata
```

不要在前端暴露 Supabase service role key。

### 9.3 文件路径规范

```text
packages/{package_id}/outer/{uuid}.jpg
packages/{package_id}/label/{uuid}.jpg
packages/{package_id}/inner/{uuid}.jpg
packages/{package_id}/exception/{uuid}.jpg
```

---

## 10. 身份认证与权限

### 10.1 微信用户登录

流程：

```text
miniprogram wx.login()
→ 获取 code
→ POST /auth/wechat-login
→ backend 调用 WeChat code2Session
→ 获取 openid
→ 创建或更新 User
→ 返回 JWT
```

JWT payload：

```json
{
  "sub": "user_id",
  "type": "USER",
  "openid": "wechat_openid"
}
```

### 10.2 Admin 登录

MVP 可使用：

- email/username + password。
- bcrypt hash。
- JWT。

JWT payload：

```json
{
  "sub": "admin_id",
  "type": "ADMIN",
  "role": "SUPER_ADMIN"
}
```

### 10.3 权限规则

用户：

- 只能访问自己的订单。
- 只能确认自己的包裹。
- 只能查看自己的图片。

管理员：

- 可操作所有订单。
- override 操作必须记录日志。

---

## 11. API 设计原则

- 所有 API 走 HTTPS。
- 所有业务 API 返回统一结构。
- 小程序和 frontend 共用同一套 API。
- 管理员 API 使用 `/admin` 前缀或 admin guard。
- 用户 API 使用 user guard。
- 错误返回统一 error code。
- 分页统一使用 `page` 和 `pageSize`。
- 时间字段统一 ISO 8601。

---

## 12. 小程序架构

小程序目录：

```text
miniprogram/
├── app.js
├── app.json
├── app.wxss
├── config/
│   └── index.js
├── utils/
│   ├── request.js
│   ├── auth.js
│   └── status-map.js
├── pages/
│   ├── home/
│   ├── address/
│   ├── orders/
│   ├── order-detail/
│   ├── profile/
│   └── privacy/
└── components/
```

关键：

- 小程序只调用 `https://api.gjxpress.io`。
- token 存储在本地 storage。
- 401 时重新登录。
- 所有状态文案通过 status-map 管理。
- 隐私政策入口必须存在。

---

## 13. Frontend 架构

Next.js 目录建议：

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── services/
│   ├── guides/
│   ├── recommendations/
│   ├── contact/
│   └── admin/
├── components/
├── lib/
├── public/
└── docs/
```

### 13.1 Public Site

用于：

- SEO。
- 服务介绍。
- 推荐系统。
- 引导用户使用微信小程序。

### 13.2 Admin UI

MVP 可放在 `frontend/app/admin`。后期如果复杂，可拆成独立 admin app。

### 13.3 SEO 要求

- 每个公开页面需要 title、description。
- 页面内容服务端可读。
- 重要页面使用静态生成或服务端渲染。
- 推荐系统内容需要可索引 URL。

---

## 14. 部署架构

### 14.1 Backend on AWS EC2

```text
Client
→ https://api.gjxpress.io
→ Nginx
→ Docker container: NestJS on port 3000
→ Supabase Postgres / Storage
```

EC2 运行：

- Docker。
- Docker Compose。
- Nginx。
- Certbot 或其他 SSL 方案。

Docker container 只暴露到 localhost：

```text
127.0.0.1:3000:3000
```

### 14.2 Frontend on Vercel

```text
www.gjxpress.io → Vercel Next.js
```

Vercel 环境变量：

```env
NEXT_PUBLIC_API_BASE_URL=https://api.gjxpress.io
```

### 14.3 Supabase

Supabase project 存放：

- Postgres。
- Storage。

Backend 环境变量：

```env
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=
```

---

## 15. CI/CD 建议

### 15.1 MVP 手动部署

初期可以：

```text
本地 build Docker image
→ push GitHub
→ SSH 到 EC2
→ git pull
→ docker compose build
→ docker compose up -d
→ prisma migrate deploy
```

### 15.2 后期自动部署

可升级为：

```text
GitHub Actions
→ build backend Docker image
→ push image registry
→ EC2 pull image
→ run migrate deploy
→ restart service
```

Frontend：

```text
GitHub push → Vercel auto deploy
```

---

## 16. 日志与监控

MVP 需要：

- 后端 request log。
- error log。
- AdminActionLog。
- NotificationLog。
- QRScanLog。

后期可加：

- Sentry。
- CloudWatch。
- Uptime Kuma。
- Grafana。

---

## 17. 安全要求

### 17.1 Secret 管理

不得提交：

- WeChat AppSecret。
- Supabase service role key。
- JWT secret。
- Admin password。

所有 secret 放环境变量。

### 17.2 网络安全

- API 必须 HTTPS。
- Docker 3000 端口不直接暴露公网。
- Nginx 代理到 localhost。
- Supabase service key 只在后端使用。

### 17.3 数据访问安全

- 后端强制检查 user ownership。
- Admin API 强制 admin guard。
- 图片访问需要校验归属，或使用短期签名 URL。

### 17.4 操作安全

- override 必须二次确认。
- override 必须填写 reason。
- 关键修改必须写日志。

---

## 18. 可扩展方向

未来可扩展：

- 第三方物流 API 拉取。
- 定时任务 worker。
- 多仓库。
- 多价格规则。
- 数据看板。
- 推荐系统。
- 用户增长和 referral。
- 多管理员角色。
- S3 / RDS 迁移。

---

## 19. 当前推荐实施顺序

1. 整理 monorepo 和 docs。
2. 后端适配 Supabase Postgres。
3. 后端适配 Supabase Storage。
4. Next.js frontend 初始化。
5. 小程序 API base URL 切换到 staging。
6. EC2 部署后端。
7. Vercel 部署 frontend。
8. 微信 DevTools 真机联调。
9. 准备微信审核版本。
