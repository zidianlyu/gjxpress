# Backend Deployment

## Required Services

- Supabase Postgres
- Supabase Storage
- Backend host running NestJS

## Required Env

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES`

Optional:

- `JWT_EXPIRES_IN`
- `ADMIN_JWT_EXPIRES_IN`
- `PORT`
- `CORS_ORIGINS`
- Warehouse address variables

Do not log or document real secret values.

## Deploy Notes

- Use Prisma migrations for database changes.
- Use `prisma migrate deploy` only after reviewing migration files.
- Do not run reset/drop/truncate commands against shared databases.
- Verify `GET /api/health` after deployment.

The retired mini program deployment path has been removed.
