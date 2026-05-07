# Project Context

GJXpress / 广骏供应链服务 is now focused on the Web product line:

- Public website
- Admin Portal
- Backend API

The mini program direction has been retired and removed from the repository.

## Current Rules

- `frontend/` is Next.js and must call backend APIs for business data.
- `backend/` is NestJS + Prisma + Supabase Postgres + Supabase Storage.
- Frontend must not directly access Supabase.
- Do not add online payment.
- Do not log or document secrets, JWTs, Authorization headers, service role keys, or app secrets.
- Database changes go through Prisma schema and migrations.

## Preserve

- Public contact WeChat IDs in website content.
- Admin auth and roles.
- Public registration and tracking.
- Customer/customerCode logic.
- Inbound packages, customer shipments, master shipments, transaction records.
- Supabase Storage image upload/delete flows.
- `GET /api/health`.
