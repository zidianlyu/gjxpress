# Backend Deployment Guide — GJXpress Logistic OS

> Scope: Deploy `backend/` NestJS API to AWS EC2 using Docker Compose
> Domain: `api.gjxpress.net`
> Database: Supabase Postgres
> Storage: Supabase Storage
> Process: Docker container behind Nginx HTTPS reverse proxy

---

## 1. Deployment Goal

Production API should be reachable at:

```text
https://api.gjxpress.net/health
```

Expected response:

```json
{
  "data": {
    "status": "ok"
  }
}
```

The WeChat Mini Program, Admin UI, and Next.js frontend will call:

```text
https://api.gjxpress.net
```

---

## 2. Deployment Architecture

```text
WeChat Mini Program
        |
        v
https://api.gjxpress.net
        |
        v
Nginx on AWS EC2 :443
        |
        v
Docker container: NestJS API on 127.0.0.1:3000
        |
        +--> Supabase Postgres
        |
        +--> Supabase Storage
        |
        +--> WeChat API
```

---

## 3. Environments

Recommended environments:

```text
local       developer machine
production  AWS EC2 + Supabase production project
```

Optional future:

```text
staging     separate EC2 or same EC2 different container/port
```

---

## 4. Local Development

Daily local development should run NestJS directly.

```bash
cd backend
npm install
npm run start:dev
```

Local API:

```text
http://localhost:3000
```

Check health:

```bash
curl http://localhost:3000/health
```

---

## 5. Local Docker Test

Docker should be tested before EC2 deployment.

```bash
cd backend
docker compose -f docker-compose.local.yml up --build
```

Check:

```bash
curl http://localhost:3000/health
```

Stop:

```bash
docker compose -f docker-compose.local.yml down
```

---

## 6. Required Backend Files

Windsurf should create or maintain:

```text
backend/
├── Dockerfile
├── docker-compose.local.yml
├── docker-compose.production.yml
├── .env.example
├── .env.local.example
├── .env.production.example
├── prisma/
├── src/
└── README.md
```

---

## 7. Dockerfile

Recommended `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

Notes:

- Use Node LTS.
- `prisma generate` must run during build.
- Do not copy `.env.production` into image.
- Runtime env comes from Docker Compose.

---

## 8. Local Docker Compose

`backend/docker-compose.local.yml`:

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: gjxpress-api-local
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env.local
```

---

## 9. Production Docker Compose

`backend/docker-compose.production.yml`:

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: gjxpress-api
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    env_file:
      - .env.production
```

Important:

```text
Bind to 127.0.0.1 only.
Nginx exposes HTTPS publicly.
Do not expose port 3000 directly to the internet.
```

---

## 10. Environment Variables

## 10.1 `.env.example`

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=
DIRECT_URL=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES=gjxpress-storage

JWT_SECRET=
JWT_EXPIRES_IN=7d
ADMIN_JWT_EXPIRES_IN=1d

WECHAT_APP_ID=
WECHAT_APP_SECRET=

CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,https://gjxpress.net,https://www.gjxpress.net,https://admin.gjxpress.net

PUBLIC_API_BASE_URL=http://localhost:3000
```

## 10.2 Production Values

On EC2, create:

```bash
cd ~/gjxpress/backend
nano .env.production
```

Example:

```env
NODE_ENV=production
PORT=3000

DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="xxxxx"
SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES="gjxpress-storage"

JWT_SECRET="generate-a-long-random-secret"
JWT_EXPIRES_IN="7d"
ADMIN_JWT_EXPIRES_IN="1d"

WECHAT_APP_ID="wx..."
WECHAT_APP_SECRET="..."

CORS_ORIGINS="https://gjxpress.net,https://www.gjxpress.net,https://admin.gjxpress.net"
PUBLIC_API_BASE_URL="https://api.gjxpress.net"
```

Do not commit `.env.production`.

---

## 11. Supabase Setup

## 11.1 Create Project

Create Supabase project:

```text
Project name: gjxpress-production
Region: choose closest to expected users if possible
Database password: strong password
```

## 11.2 Get Connection Strings

Need:

```text
DATABASE_URL
DIRECT_URL
```

Use pooled connection for runtime if available and direct connection for Prisma migrations.

## 11.3 Storage Buckets

Create buckets:

```text
gjxpress-storage
payment-proofs
exception-images
public-assets
```

Recommended privacy:

```text
gjxpress-storage: private
payment-proofs: private
exception-images: private
public-assets: public
```

## 11.4 Service Role Key

Use service role key only on backend.

Never expose it to:

```text
miniprogram/
frontend/
browser JavaScript
GitHub
logs
```

---

## 12. AWS EC2 Setup

## 12.1 Recommended Instance

For MVP:

```text
Instance: t3.small or t3.micro
OS: Ubuntu 22.04 or 24.04 LTS
Disk: 20GB+
Region: US West or US East
```

## 12.2 Security Group

Open:

```text
22   SSH from your IP only
80   HTTP from anywhere
443  HTTPS from anywhere
```

Do not open:

```text
3000
5432
```

## 12.3 Elastic IP

Allocate and attach Elastic IP to EC2.

Reason:

```text
DNS api.gjxpress.net should point to stable IP.
```

---

## 13. Install Server Dependencies

SSH into EC2:

```bash
ssh ubuntu@<EC2_ELASTIC_IP>
```

Install:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

Log out and back in.

Verify:

```bash
docker --version
docker compose version
nginx -v
```

---

## 14. DNS Setup in Namecheap

In Namecheap DNS:

```text
Host: api
Type: A
Value: <EC2 Elastic IP>
TTL: Automatic or 5 min
```

Verify:

```bash
dig api.gjxpress.net
ping api.gjxpress.net
```

---

## 15. Nginx Setup

Create config:

```bash
sudo nano /etc/nginx/sites-available/gjxpress-api
```

Content:

```nginx
server {
    listen 80;
    server_name api.gjxpress.net;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/gjxpress-api /etc/nginx/sites-enabled/gjxpress-api
sudo nginx -t
sudo systemctl reload nginx
```

---

## 16. HTTPS with Let's Encrypt

After DNS points to EC2:

```bash
sudo certbot --nginx -d api.gjxpress.net
```

Verify auto-renew:

```bash
sudo certbot renew --dry-run
```

Test:

```bash
curl https://api.gjxpress.net/health
```

---

## 17. Deploy Backend to EC2

## 17.1 Clone Repo

```bash
cd ~
git clone <your-repo-url> gjxpress
cd gjxpress/backend
```

## 17.2 Create `.env.production`

```bash
nano .env.production
```

Paste production env values.

## 17.3 Build and Start

```bash
docker compose -f docker-compose.production.yml up -d --build
```

Check logs:

```bash
docker logs -f gjxpress-api
```

Check container:

```bash
docker ps
```

Check local health:

```bash
curl http://127.0.0.1:3000/health
```

Check public health:

```bash
curl https://api.gjxpress.net/health
```

---

## 18. Prisma Production Migration

Run:

```bash
docker exec -it gjxpress-api npx prisma migrate deploy
```

If needed:

```bash
docker exec -it gjxpress-api npx prisma generate
```

Do not run:

```bash
npx prisma migrate dev
```

on production.

---

## 19. First Admin Seed

Recommended:

```bash
docker exec -it gjxpress-api npm run seed:admin
```

or:

```bash
docker exec -it gjxpress-api npx prisma db seed
```

Seed should create:

```text
SUPER_ADMIN username/password
sample warehouse address
optional test user/order
```

Make sure production seed does not create public fake data unless intended.

---

## 20. CORS Configuration

NestJS should allow:

```text
https://gjxpress.net
https://www.gjxpress.net
https://admin.gjxpress.net
```

Mini Program API calls are not browser CORS-constrained in the same way, but backend CORS still helps web frontend/admin.

Example:

```ts
app.enableCors({
  origin: configService.get('CORS_ORIGINS').split(','),
  credentials: true,
});
```

---

## 21. WeChat Mini Program Configuration

In WeChat Mini Program admin console, configure legal domains:

```text
request 合法域名:
https://api.gjxpress.net

uploadFile 合法域名:
https://api.gjxpress.net

downloadFile 合法域名:
https://api.gjxpress.net
```

If Mini Program later directly downloads Supabase image URLs, add Supabase storage domain. MVP recommendation is to go through backend/signed URLs first.

---

## 22. Deployment Workflow

## 22.1 Manual MVP Workflow

On local:

```bash
git add .
git commit -m "update backend"
git push
```

On EC2:

```bash
cd ~/gjxpress
git pull
cd backend
docker compose -f docker-compose.production.yml up -d --build
docker exec -it gjxpress-api npx prisma migrate deploy
docker logs -f gjxpress-api
```

## 22.2 Future CI/CD

Future flow:

```text
GitHub Actions
→ build Docker image
→ push to GHCR or AWS ECR
→ SSH EC2 pull image
→ docker compose restart
```

Not required for MVP.

---

## 23. Logging

## 23.1 Docker Logs

```bash
docker logs -f gjxpress-api
```

## 23.2 Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 23.3 Future

Add:

```text
AWS CloudWatch Agent
Sentry
UptimeRobot or Better Stack
```

---

## 24. Backup and Recovery

## 24.1 Database

Supabase handles managed Postgres, but before major migration:

```text
Take manual backup/export from Supabase dashboard.
Test migration locally or on dev project.
```

## 24.2 Environment Files

Keep `.env.production` secure.

Recommended backup:

```text
password manager
encrypted secrets manager
```

Do not store production env in plain text notes.

---

## 25. Security Hardening

Minimum:

1. SSH only from your IP.
2. Disable direct public access to port 3000.
3. Use HTTPS only.
4. Keep Ubuntu updated.
5. Use strong JWT secret.
6. Use strong admin passwords.
7. Do not log secrets.
8. Do not expose Supabase service role key.
9. Rotate keys if accidentally committed.
10. Keep domain auto-renew enabled.

Optional:

```bash
sudo apt install -y unattended-upgrades
```

---

## 26. Troubleshooting

## 26.1 `curl http://127.0.0.1:3000/health` fails

Check:

```bash
docker ps
docker logs gjxpress-api
```

Common causes:

```text
.env.production missing
DATABASE_URL wrong
Prisma client not generated
NestJS build failed
Port mismatch
```

## 26.2 `https://api.gjxpress.net/health` fails but local health works

Check:

```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

Common causes:

```text
DNS not propagated
Nginx config wrong
Certbot not completed
Security group missing 443
```

## 26.3 Prisma migration fails

Check:

```text
DIRECT_URL
DATABASE_URL
Supabase database password
SSL mode
migration history
```

Production uses:

```bash
npx prisma migrate deploy
```

not `migrate dev`.

## 26.4 WeChat Mini Program cannot call API

Check:

```text
API uses HTTPS
domain configured in WeChat legal domains
certificate valid
endpoint returns JSON
no IP-only URL
no localhost
```

---

## 27. Release Checklist

Before considering backend deployed:

```text
[ ] /health works locally
[ ] /health works through https://api.gjxpress.net
[ ] Prisma migrations deployed
[ ] Supabase connection works
[ ] Supabase Storage bucket exists
[ ] Admin login works
[ ] WeChat login works or mock login disabled
[ ] CORS configured
[ ] Nginx HTTPS configured
[ ] Docker container restarts automatically
[ ] Port 3000 not publicly open
[ ] WeChat legal domain configured
[ ] No secrets committed
```

---

## 28. API Request Logging & Tracing

### 28.1 Environment Variables

Add to `.env` (or `.env.production`):

```bash
# Enable per-request logging (default: true)
API_REQUEST_LOGGING=true

# Log redacted request bodies in development only (default: false)
API_DEBUG_BODY_LOGS=false

# NestJS log level
LOG_LEVEL=debug
```

**Security rules:**
- `API_DEBUG_BODY_LOGS=true` should only be used in development.
- Body logs automatically redact: `password`, `passwordHash`, `token`, `accessToken`, `refreshToken`, `authorization`, `secret`, `apiKey`.
- Stack traces are logged to backend console only — **never returned to the frontend**.

### 28.2 What Backend Console Logs

Every request produces one line:

```text
[API] requestId=abc-123 method=POST path=/api/admin/customers status=201 durationMs=45 userType=admin userId=... role=ADMIN
```

On 4xx (warning):
```text
[API_WARN] requestId=abc-123 method=POST path=/api/admin/customers status=409 durationMs=21 userType=admin userId=... message="Phone number already exists"
```

On 5xx (error):
```text
[API_ERROR] requestId=abc-123 method=POST path=/api/admin/customers status=500 durationMs=12 unauthenticated message="Internal server error"
<stack trace here — backend only>
```

### 28.3 X-Request-Id Header

Every response includes:

```text
X-Request-Id: abc-123-uuid
```

CORS `exposedHeaders` includes `x-request-id` so browsers can read it.

**Frontend can read it via:**
```javascript
const requestId = response.headers.get('x-request-id');
```

**Error responses always include `requestId`:**
```json
{
  "statusCode": 409,
  "error": "ConflictException",
  "message": "Phone number already exists",
  "requestId": "abc-123-uuid",
  "timestamp": "2026-05-05T...",
  "path": "/api/admin/customers"
}
```

**Frontend passes its own request ID:**
```javascript
fetch('/api/admin/customers', {
  headers: { 'X-Request-Id': 'my-trace-id' }
});
```

### 28.4 Viewing Logs in Production

```bash
# Follow live Docker logs (use actual service name from docker-compose.production.yml)
docker compose -f docker-compose.production.yml logs -f backend

# Filter for errors only
docker compose -f docker-compose.production.yml logs backend | grep '\[API_ERROR\]\|\[REQUEST_ERROR\]'

# Filter by requestId to trace a specific request
docker compose -f docker-compose.production.yml logs backend | grep 'requestId=abc-123'

# Last 100 lines
docker compose -f docker-compose.production.yml logs --tail=100 backend
```

### 28.5 Correlating Frontend DevTools with Backend Logs

1. Open browser DevTools → Network tab.
2. Click a failed request.
3. Copy the `x-request-id` from response headers.
4. Search backend logs: `grep 'requestId=<that-id>'`.

### 28.6 Implementation Files

| File | Purpose |
|---|---|
| `src/common/middleware/request-id.middleware.ts` | Assigns/propagates `X-Request-Id` per request |
| `src/common/interceptors/request-logging.interceptor.ts` | Logs method, path, status, duration, user info |
| `src/common/filters/http-exception.filter.ts` | Formats error responses with `requestId`; logs 5xx stacks |
| `src/main.ts` | Wires all three globally; sets `exposedHeaders` in CORS |

---

## 29. Windsurf Implementation Checklist

Ask Windsurf to implement:

1. `Dockerfile`
2. `docker-compose.local.yml`
3. `docker-compose.production.yml`
4. `/health` endpoint
5. env validation module
6. CORS setup
7. README deployment section
8. Prisma production migration command
9. Supabase storage env variables
10. Nginx config snippet in docs

Do not ask Windsurf to access production credentials directly.
