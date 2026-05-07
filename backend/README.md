# GJXpress Backend

NestJS API for 广骏供应链服务.

## Stack

- NestJS
- Prisma
- Supabase Postgres
- Supabase Storage
- JWT admin auth

微信小程序登录已移除。Backend 不再提供小程序登录 API，不再要求相关平台凭据，也不调用第三方会话交换接口。

## Required Env

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_SERVICE_ROLE_KEY="..."
JWT_SECRET="your-strong-random-secret-min-32-chars"
SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES="gjxpress-storage"
```

Optional:

```env
JWT_EXPIRES_IN="7d"
ADMIN_JWT_EXPIRES_IN="1d"
PORT=3000
CORS_ORIGINS="http://localhost:3000,http://localhost:5173"
```

Never commit `.env`, `.env.local`, `.env.production`, JWTs, Authorization headers, or service role keys.

## Development

```bash
npm install
npx prisma generate
npm run start:dev
```

Health check:

```bash
curl http://localhost:3000/api/health
```

## Current API Areas

- `GET /api/health`
- `POST /api/auth/admin-login`
- `GET /api/auth/me`
- Public tracking
- Public registration
- Admin customers
- Admin customer registrations
- Admin inbound packages
- Admin customer shipments
- Admin master shipments
- Admin transactions
- Supabase Storage image upload/delete flows

## Database Changes

Use Prisma schema and migrations only. Do not hand-write business tables in Supabase SQL Editor. Do not run `prisma migrate reset`, `DROP TABLE`, or `TRUNCATE` against shared databases. For destructive changes, create the migration only and review `migration.sql` before deployment.
