# GJXpress Backend

Logistic OS backend for 广骏供应链服务 (GJ Supply Chain / GJXpress).

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (`@supabase/supabase-js`)
- **Auth**: JWT + WeChat Mini Program (code2Session) + Mock login for dev
- **Deployment**: AWS EC2 + Docker Compose

## Project Structure

```
src/
├── config/            # Environment validation (Joi)
├── common/            # Guards, decorators, filters, utils
├── prisma/            # Prisma service and module
├── auth/              # WeChat login + Admin login + JWT
├── user/              # User profile management
├── order/             # Order CRUD + status flow
├── package/           # Package inbound / confirm / exception
├── image/             # Image metadata management
├── storage/           # Supabase Storage integration
├── exception/         # Exception reporting & handling
├── payment/           # Payment status management
├── shipment/          # Shipping management
├── qr/                # QR code for delivery confirmation
├── notification/      # Notification service
├── address/           # Warehouse address
├── adminlog/          # Admin operation logs
└── health/            # Health check (DB + Storage)
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Supabase account (database + storage)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create `.env` (or `.env.local`)

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

#### How to get Supabase credentials

| Variable | Where to find |
|----------|--------------|
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection String → **Transaction pooler** (port 6543, append `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase Dashboard → Settings → Database → Connection String → **Session mode** (port 5432) |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → **Project URL** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → **service_role** key (keep secret!) |

#### Required env variables

```env
DATABASE_URL="postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:5432/postgres"
SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
JWT_SECRET="your-strong-random-secret-min-32-chars"
```

#### Optional env variables

```env
JWT_EXPIRES_IN="7d"                          # default: 7d
ADMIN_JWT_EXPIRES_IN="1d"                    # default: 1d
WECHAT_MOCK_LOGIN=true                       # default: false. Set true for dev.
WECHAT_APP_ID=""                             # required if WECHAT_MOCK_LOGIN=false
WECHAT_APP_SECRET=""                         # required if WECHAT_MOCK_LOGIN=false
SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES="gjxpress-storage"  # default bucket name
PORT=3000
CORS_ORIGINS="http://localhost:3000,http://localhost:5173"
```

> **Never commit `.env`, `.env.local`, or `.env.production` to git.**

### 3. Validate & Generate Prisma Client

```bash
npx prisma validate     # Check schema is correct
npx prisma generate     # Generate typed Prisma Client
```

### 4. Database Migration

**Recommended (with migration files):**

```bash
# Apply existing migrations to Supabase
npx prisma migrate deploy
```

**If no migration files exist yet (prototype stage):**

```bash
# Push schema directly (no migration history)
npx prisma db push
```

> ⚠️ `prisma db push` is a **temporary** solution for prototyping. It does not create migration files. For production, always use `prisma migrate deploy` with proper migration files.

**To create a new migration locally:**

```bash
npx prisma migrate dev --name describe_your_change
```

> ⚠️ **Never run** `prisma migrate reset`, `DROP TABLE`, or destructive commands against the shared Supabase database.

### 5. Start Development Server

```bash
npm run start:dev
```

### 6. Verify

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-05-04T...",
  "service": "gjxpress-api",
  "database": "ok",
  "storage": "ok"
}
```

- **API base**: `http://localhost:3000/api`
- **Swagger docs**: `http://localhost:3000/docs`
- **Health check**: `http://localhost:3000/api/health`

---

## Supabase Storage Setup

1. Go to Supabase Dashboard → Storage → **Create bucket**
2. Bucket name: `gjxpress-storage`
3. Recommended: **Private bucket** (use signed URLs for access)
4. The backend uses `SUPABASE_SERVICE_ROLE_KEY` internally to generate signed upload/read URLs — this key is never exposed to the frontend or mini program

---

## WeChat Mock Login (Development)

Set `WECHAT_MOCK_LOGIN=true` in your `.env`.

Then call:
```bash
curl -X POST http://localhost:3000/api/auth/wechat-login \
  -H 'Content-Type: application/json' \
  -d '{"code": "dev-test"}'
```

In mock mode:
- The `code` is used to generate a deterministic mock openid: `mock_openid_<code>`
- A User is created/updated and a JWT is returned
- No real WeChat API is called

In production mode (`WECHAT_MOCK_LOGIN=false`):
- `WECHAT_APP_ID` and `WECHAT_APP_SECRET` are **required**
- The backend calls WeChat `code2Session` API to verify the code
- `openid` comes from WeChat server only; frontend-provided openid is never trusted

---

## Environment Validation

On startup, the app validates all required env variables using **Joi**.
If any required variable is missing, the app will fail to start with a clear error message:

```
Error: Config validation error: "DATABASE_URL" is required. Get it from Supabase Dashboard → Settings → Database → Connection String (Transaction pooler).
```

---

## API Endpoints

### Health
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check (DB + Storage) |

### Auth
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/wechat-login` | POST | No | WeChat Mini Program login (or mock login) |
| `/api/auth/admin-login` | POST | No | Admin login |
| `/api/auth/me` | GET | JWT | Get current user/admin profile |

### User
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/user/profile` | GET | JWT | Get user profile |

### Orders
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/orders` | GET | JWT | List my orders |
| `/api/orders/:id` | GET | JWT | Get order detail |

### Packages
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/packages/:id` | GET | JWT | Get package detail |
| `/api/packages/:id/confirm` | POST | JWT | Confirm package |
| `/api/packages/:id/issue` | POST | JWT | Report exception |
| `/api/admin/packages/inbound` | POST | Admin | Create inbound package |

### Shipments
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/shipments` | POST | Admin | Create shipment |

---

## Common Commands

```bash
# Development
npm run start:dev              # Start with hot reload
npm run build                  # Build for production
npm run test                   # Run tests

# Prisma
npm run prisma:validate        # Validate schema
npm run prisma:generate        # Generate Prisma Client
npm run prisma:migrate:dev     # Create new migration (local)
npm run prisma:migrate:deploy  # Apply migrations (production/Supabase)
npm run prisma:db:push         # Push schema directly (prototype only)
npm run prisma:studio          # Open Prisma Studio GUI
npm run prisma:seed            # Seed test data
```

---

## Order Status Flow

```
UNINBOUND → INBOUNDED → USER_CONFIRM_PENDING → REVIEW_PENDING
  → PAYMENT_PENDING → PAID → READY_TO_SHIP → SHIPPED → COMPLETED
```

At any point, an order can move to `EXCEPTION` or `CANCELLED`.

---

## Security

1. **Never commit secrets** — `.env*` files are in `.gitignore`
2. **`SUPABASE_SERVICE_ROLE_KEY`** — Only used server-side, never returned to clients
3. **JWT_SECRET** — Minimum 32 characters
4. **HTTPS only** in production

---

## License

Private - GJXpress Logistic OS
