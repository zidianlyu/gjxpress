# ADR 0001: Use NestJS as the Backend Framework

## Status

Accepted

## Date

2026-05-04

## Decision

Use **NestJS + TypeScript** as the primary backend framework for GJXpress / 广骏供应链服务.

The backend will be implemented as a modular NestJS API service and deployed to **AWS EC2 using Docker**. It will connect to **Supabase Postgres** through **Prisma** and interact with **Supabase Storage** for package images and related files.

## Context

GJXpress is a Logistic OS for cross-border consolidation and logistics between China and the United States. The backend must support three clients:

1. **WeChat Mini Program** for customers.
2. **Next.js frontend / admin UI** for public SEO pages, recommendations, and internal operations.
3. **Future integrations** such as logistics APIs, notification services, image processing, and scheduled jobs.

The backend needs to handle:

- WeChat login and user identity mapping.
- Order, package, inbound, shipment, and exception workflows.
- Admin override and audit logging.
- Supabase Postgres persistence through Prisma.
- Supabase Storage file metadata and access control.
- WeChat subscription notifications.
- Scheduled jobs such as timeout checks, logistics polling, and notification retries.
- Lightweight recommendation APIs for the public site.

The project is early-stage but expected to become an operational system. We need a framework that is fast enough to ship, structured enough to maintain, and compatible with a small team and AI-assisted coding through Windsurf.

## Decision Drivers

- Strong TypeScript support.
- Clear modular structure.
- Easy API/controller/service organization.
- Good compatibility with Prisma.
- Suitable for REST APIs and future background jobs.
- Easy to containerize and deploy to EC2.
- Unified JavaScript/TypeScript ecosystem with Next.js.
- More maintainable than an unstructured Express app.
- Lower operational complexity than Go microservices at MVP stage.

## Chosen Architecture

Backend framework:

```text
NestJS + TypeScript
```

Runtime:

```text
Node.js LTS
```

Deployment:

```text
AWS EC2
→ Docker Compose
→ NestJS container on localhost:3000
→ Nginx HTTPS reverse proxy
→ api.gjxpress.net
```

Database access:

```text
NestJS
→ Prisma
→ Supabase Postgres
```

File storage:

```text
NestJS
→ Supabase Storage SDK
→ private storage buckets
```

## Backend Module Boundaries

The backend should be organized around domain modules, not technical folders only.

Recommended initial module structure:

```text
backend/src/
├── app.module.ts
├── main.ts
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── interceptors/
│   └── utils/
├── config/
├── prisma/
├── auth/
├── users/
├── orders/
├── packages/
├── inbound/
├── images/
├── payments/
├── shipments/
├── logistics/
├── exceptions/
├── qr/
├── notifications/
├── recommendations/
├── admin/
├── audit-logs/
└── health/
```

## Design Rules

### Controllers

Controllers should only:

- Parse request parameters.
- Validate DTOs.
- Call services.
- Return normalized response objects.

Controllers should not contain business logic.

### Services

Services should contain domain logic, such as:

- Order state transitions.
- Payment gating.
- Package confirmation.
- Admin override behavior.
- Exception handling.
- QR token generation and validation.
- Notification trigger decisions.

### DTOs and Validation

Use DTO classes for request validation.

Examples:

```text
CreateOrderDto
InboundPackageDto
UpdatePaymentStatusDto
CreateShipmentDto
ReportPackageIssueDto
```

### Guards

Use NestJS guards for:

- JWT authentication.
- Admin-only endpoints.
- Ownership checks where appropriate.

Examples:

```text
JwtAuthGuard
AdminGuard
UserOwnsOrderGuard
```

### State Machine Discipline

Order and package state transitions should be centralized in services.

Do not let random controllers directly mutate status fields.

Required behavior:

- Unpaid orders cannot be shipped unless admin override is used.
- User can only confirm packages belonging to their own account.
- Admin override must set `manual_override = true` and write an audit log.
- Exception status should pause normal workflow until resolved.

### Audit Logging

All important admin actions must create audit records.

Examples:

```text
ADMIN_MARK_PAYMENT_PAID
ADMIN_FORCE_SHIPMENT
ADMIN_UPDATE_ORDER_STATUS
ADMIN_RESOLVE_EXCEPTION
ADMIN_EDIT_PACKAGE_WEIGHT
ADMIN_UPLOAD_INBOUND_IMAGE
```

### API Response Shape

Use consistent response objects.

Recommended success shape:

```json
{
  "data": {},
  "meta": {}
}
```

Recommended error shape:

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}
```

## Alternatives Considered

### Express / Fastify without NestJS

Pros:

- Smaller framework.
- Faster to start for very simple APIs.

Cons:

- More manual architecture decisions.
- Higher risk of inconsistent controller/service structure.
- Less suitable once workflows, guards, DTOs, audit logging, and scheduled jobs grow.

Rejected because the project is already more than a small API.

### Python Flask / FastAPI

Pros:

- Fast for prototypes.
- Good ecosystem for scripting and data tasks.

Cons:

- Different language from frontend stack.
- More split in team context.
- We already use TypeScript for Next.js and can keep backend/frontend closer.

Rejected for the core API. Python may still be used later for separate crawler or data jobs if needed.

### Go

Pros:

- Excellent performance.
- Strong concurrency model.
- Good for high-throughput workers.

Cons:

- Higher initial development overhead for current team context.
- Less convenient for quick business iteration.
- Not necessary for MVP API load.

Rejected for the initial backend. Go may be used later for specialized high-volume logistics polling or worker services.

### Next.js API Routes Only

Pros:

- One frontend/backend deployment on Vercel.
- Simple for public website APIs.

Cons:

- Less suitable for operational backend workflows, scheduled jobs, admin audit logging, and WeChat integration.
- Would mix public SEO frontend concerns with core Logistic OS backend concerns.

Rejected. Next.js should remain frontend/public-site focused.

## Consequences

### Positive

- Clear modular backend structure.
- Good fit for domain workflows and guards.
- Strong TypeScript consistency across backend and frontend.
- Good Prisma integration.
- Easy Docker deployment.
- Easy for Windsurf to reason about modules and generate code.

### Negative

- More framework concepts than Express.
- Slightly heavier than minimal Node.js APIs.
- Performance is not as high as Go for CPU-heavy tasks.
- Requires discipline to avoid over-engineering modules.

## Implementation Notes

### Required Packages

Initial backend dependencies may include:

```text
@nestjs/common
@nestjs/core
@nestjs/config
@nestjs/jwt
@nestjs/passport
@nestjs/schedule
@nestjs/swagger
class-validator
class-transformer
prisma
@prisma/client
@supabase/supabase-js
```

### Runtime Environment Variables

Required environment variables:

```text
NODE_ENV
PORT
DATABASE_URL
DIRECT_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
```

### Health Check

Backend must expose:

```text
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

### Deployment

Development:

```bash
npm run start:dev
```

Production:

```bash
docker compose -f docker-compose.production.yml up -d
```

Migration in production:

```bash
npx prisma migrate deploy
```

Do not run `prisma migrate dev` in production.

## Related Documents

- `docs/prd.md`
- `docs/architecture.md`
- `docs/api_contract.md`
- `backend/docs/prd.md`
- `backend/docs/database.md`

## References

- NestJS Documentation: https://docs.nestjs.com/
- Prisma Documentation: https://www.prisma.io/docs
- Supabase Documentation: https://supabase.com/docs
