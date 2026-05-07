# GJXpress PRD

广骏供应链服务当前主线是 Web：Public 官网 + Admin Portal + Backend API。

## Scope

- Public registration
- Public tracking
- Admin auth and role-based operations
- Customer/customerCode management
- Inbound packages
- Customer shipments
- Master shipments
- Transaction records
- Supabase Storage image workflows

## Technical Direction

- Frontend: Next.js.
- Backend: NestJS + Prisma.
- Database: Supabase Postgres.
- Storage: Supabase Storage through backend only.

Frontend must call backend APIs for business data and must not access Supabase directly.

## Out Of Scope

- Retired mini program client.
- Third-party mini program login.
- Online payment.

Public WeChat IDs remain contact information and should stay visible in public contact surfaces.
