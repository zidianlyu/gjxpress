# Architecture

## Current Direction

GJXpress is a Web-first logistics system:

- Public website and Admin Portal: `frontend/` Next.js.
- API service: `backend/` NestJS.
- Database: Supabase Postgres through Prisma.
- File storage: Supabase Storage through backend services.

The mini program client has been removed and is no longer maintained.

## Access Rules

- Frontend calls backend APIs only.
- Frontend does not connect to Supabase directly.
- Backend owns authorization, business rules, Prisma access, and Storage signed URL/delete logic.
- No online payment integration is planned.

## Core Runtime Surfaces

- Public registration
- Public tracking
- Admin auth
- Admin customers
- Admin customer registration review
- Inbound packages
- Customer shipments
- Master shipments
- Transaction records
- Health check: `GET /api/health`

## Contact Info

Public WeChat IDs shown on the website are contact channels. They should remain in public-facing contact copy and are not mini program technology.
