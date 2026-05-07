# Roadmap

## Current Priority

The current development line is Web:

- Public website
- Admin Portal
- Backend API

The mini program plan has been retired and removed.

## Near-Term Work

- Stabilize public registration and tracking.
- Keep Admin Portal CRUD/API coverage healthy.
- Harden Supabase Storage upload/delete flows.
- Keep Prisma migrations reviewable before shared database deployment.
- Improve docs around Web deployment and backend operations.

## Guardrails

- Frontend calls backend APIs only.
- Backend owns all Supabase access.
- No online payment integration.
- Public contact WeChat IDs remain as contact information.
