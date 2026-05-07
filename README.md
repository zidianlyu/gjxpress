# GJXpress - 广骏供应链服务

GJXpress 是广骏供应链服务的 Web 主线项目，当前包含：

- `backend/`: NestJS + Prisma API，连接 Supabase Postgres 和 Supabase Storage。
- `frontend/`: Next.js Public 官网和 Admin Portal。

微信小程序方向已废弃，`miniprogram/` 已移除且不再维护。

## Architecture

- Public 官网和 Admin Portal 通过 backend API 访问业务数据。
- Frontend 不直接访问 Supabase。
- Backend 负责鉴权、业务规则、Prisma 数据访问、Supabase Storage 图片上传/删除。
- 不接入在线支付。

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npm run start:dev
```

Backend health check:

```bash
curl http://localhost:3000/api/health
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Core API Areas

- `GET /api/health`
- Admin auth and Admin Portal APIs
- Public tracking
- Public customer registration
- Customers
- Inbound packages
- Customer shipments
- Master shipments
- Transaction records
- Supabase Storage image flows

## Notes

Public contact 微信号是市场联系方式，应继续保留在官网和相关营销文案中。它们不是微信小程序技术栈的一部分。
