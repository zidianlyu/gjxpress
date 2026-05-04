# ADR 0002: Use Supabase Postgres and Supabase Storage

## Status

Accepted

## Date

2026-05-04

## Decision

Use **Supabase Postgres** as the primary database and **Supabase Storage** as the initial object storage layer for package images, label images, exception images, and other uploaded files.

The backend will access Postgres through **Prisma**. The backend will access Supabase Storage through the **Supabase server-side SDK** using a service-role key stored only in backend environment variables.

The Mini Program and frontend must not directly receive or store Supabase service-role credentials.

## Context

GJXpress needs to store highly structured operational data:

- Users.
- Orders.
- Packages.
- Goods items.
- Inbound records.
- Package images.
- Payment statuses.
- Shipments.
- Logistics tracking events.
- Exception cases.
- QR tokens.
- Admin audit logs.
- Recommendation records.

The project also needs image/file storage for:

- Outer package photos.
- Shipping label photos.
- Internal item photos.
- Exception evidence photos.
- Future public assets for recommendation pages.

We previously considered AWS RDS + S3. That remains a valid long-term option. However, the current project stage favors speed, lower operational overhead, and integrated dashboard tooling.

Supabase provides managed Postgres, storage, dashboard, and developer-friendly tooling in one platform. Since Supabase Postgres is still PostgreSQL, the project can preserve SQL, Prisma schema, migrations, and future migration flexibility.

## Decision Drivers

- Lower MVP cost than AWS RDS + S3.
- Faster setup and less DevOps work.
- PostgreSQL compatibility.
- Integrated dashboard for data inspection.
- Integrated object storage for package photos.
- Prisma support.
- Easy future migration path to AWS RDS if needed.
- Better fit than MongoDB for order/package/status/log relationships.

## Chosen Architecture

Database:

```text
Supabase Postgres
```

ORM:

```text
Prisma
```

Storage:

```text
Supabase Storage
```

Backend access:

```text
NestJS
→ Prisma
→ Supabase Postgres

NestJS
→ Supabase Storage SDK
→ Supabase Storage buckets
```

Client access:

```text
WeChat Mini Program
→ api.gjxpress.net
→ NestJS
→ Supabase
```

```text
Next.js Frontend
→ api.gjxpress.net
→ NestJS
→ Supabase
```

Clients should not directly use Supabase service-role credentials.

## Database Principles

### PostgreSQL as Source of Truth

All business records should be stored in Postgres:

```text
User
Order
Package
GoodsItem
InboundRecord
PackageImage
PaymentRecord
Shipment
LogisticsTrackingEvent
QrCode
QrScanLog
ExceptionCase
AdminActionLog
NotificationLog
Recommendation
```

### Prisma Migrations

Schema changes must be versioned through Prisma migrations.

Development:

```bash
npx prisma migrate dev
```

Production:

```bash
npx prisma migrate deploy
```

### JSONB for Unstable Payloads

Use structured relational columns for core business fields.
Use JSONB only for flexible or third-party data.

Good JSONB use cases:

```text
Shipment.raw_payload
LogisticsTrackingEvent.raw_payload
AdminActionLog.before_state
AdminActionLog.after_state
NotificationLog.raw_response
```

Do not use JSONB as a shortcut to avoid modeling important business fields.

### Connection URLs

For Prisma + Supabase, use both runtime and direct URLs.

Recommended environment variables:

```text
DATABASE_URL=pooled connection URL
DIRECT_URL=direct connection URL
```

Prisma schema:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Storage Principles

### Buckets

Recommended buckets:

```text
package-images       private
exception-images     private
public-assets        public or private depending on use
```

### File Types

Package image types:

```text
OUTER       外包装
LABEL       面单
INNER       内部物品
EXCEPTION   异常证据
```

### Metadata Storage

Do not store image binary data in Postgres.

Store metadata in Postgres:

```text
PackageImage
- id
- package_id
- image_type
- bucket
- storage_path
- uploaded_by_type
- uploaded_by_id
- created_at
```

### Upload Flow

Preferred upload flow:

```text
Client requests upload permission
→ backend validates user/admin permission
→ backend creates signed upload URL or handles upload
→ client uploads file
→ backend stores metadata
```

For the first MVP, backend may accept file uploads directly if simpler. However, signed upload URLs are preferred for reducing EC2 bandwidth usage.

### Access Flow

For private images:

```text
Client requests image URL
→ backend validates ownership/admin permission
→ backend creates signed read URL
→ client displays image
```

For public assets:

```text
Client reads public URL directly
```

## Alternatives Considered

### AWS RDS + S3

Pros:

- Strong production-grade infrastructure.
- More control over networking, backups, and scaling.
- Good long-term fit if everything moves deeper into AWS.

Cons:

- Higher initial setup and operational overhead.
- Requires separate configuration for database, storage, IAM, backups, and monitoring.
- More expensive and slower to set up for MVP.

Deferred. It remains the likely long-term migration target if Supabase cost, performance, or compliance becomes limiting.

### MongoDB Atlas

Pros:

- Flexible document model.
- Free tier useful for prototypes.
- Easy to evolve early schema without migrations.

Cons:

- Less natural for orders, packages, shipments, statuses, audit logs, and dashboards.
- More work to create analytics and BI queries.
- Higher risk of inconsistent document shapes.
- Migration from MongoDB to SQL later would be more painful than moving from Supabase Postgres to AWS RDS.

Rejected for the core system.

### Self-hosted Postgres on EC2

Pros:

- Cheapest possible infrastructure.
- Full control.

Cons:

- Backup, recovery, security, upgrades, disk sizing, and monitoring become our responsibility.
- Higher risk for a small team.

Rejected for production. Acceptable only for local development.

### Firebase / Firestore

Pros:

- Fast to prototype.
- Built-in auth and realtime features.

Cons:

- Document model less suitable for relational logistics workflows.
- Less aligned with Prisma and SQL analytics.

Rejected.

## Consequences

### Positive

- Fast MVP setup.
- Lower initial cost.
- Managed Postgres without self-hosting.
- Integrated file storage.
- Maintains SQL and Prisma ecosystem.
- Easy to inspect data through Supabase dashboard.
- Migration path to AWS RDS remains feasible.

### Negative

- Supabase is another platform in addition to AWS and Vercel.
- Production cost may increase with storage, bandwidth, and compute usage.
- Need to carefully manage service-role keys.
- Need to understand pooled vs direct connection behavior.
- Need a future backup and migration strategy.

## Security Rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend or Mini Program.
- Only backend can use the service-role key.
- Customer image access must be permission-checked by backend.
- Admin operations must be logged.
- Use signed URLs for private images.
- Keep package images private by default.

## Backup and Migration Strategy

### MVP

- Use Supabase managed backups if available on selected plan.
- Export Prisma schema and migrations in Git.
- Keep storage paths referenced in database.

### Growth Stage

- Schedule periodic logical database dumps.
- Export storage bucket files if needed.
- Evaluate migration to AWS RDS + S3 if operational volume justifies it.

### Migration to AWS RDS

Because Supabase is Postgres, migration can be done with:

```text
pg_dump / pg_restore
Prisma migrations
Storage file copy from Supabase Storage to S3
Update environment variables
```

## Related Documents

- `docs/prd.md`
- `docs/architecture.md`
- `docs/api_contract.md`
- `backend/docs/database.md`

## References

- Supabase Documentation: https://supabase.com/docs
- Supabase Pricing: https://supabase.com/pricing
- Prisma + Supabase Guide: https://www.prisma.io/docs/orm/overview/databases/supabase
- PostgreSQL Documentation: https://www.postgresql.org/docs/
