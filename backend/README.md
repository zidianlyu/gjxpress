# GJXpress Backend

Logistic OS backend for 广骏供应链服务 (GJ Supply Chain / GJXpress).

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Auth**: JWT + WeChat Mini Program (code2Session)
- **Deployment**: AWS EC2 + Docker Compose

## Project Structure

```
src/
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
└── health/            # Health check endpoint
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Supabase)
- Supabase account (for storage)
- WeChat Mini Program credentials

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Storage
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES="package-images"

# JWT
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
ADMIN_JWT_EXPIRES_IN="1d"

# WeChat
WECHAT_APP_ID="wx_..."
WECHAT_APP_SECRET="..."

# CORS (comma-separated)
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

- API endpoints: `http://localhost:3000/api`
- Swagger docs: `http://localhost:3000/docs`
- Health check: `http://localhost:3000/health`

## API Endpoints

### Public
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |

### Auth
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/wechat-login` | POST | No | WeChat Mini Program login |
| `/api/auth/admin-login` | POST | No | Admin login |
| `/api/auth/me` | GET | JWT | Get current user |

### User
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/user/profile` | GET | JWT | Get user profile |

### Orders
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/orders` | GET | JWT | List my orders |
| `/api/orders/:id` | GET | JWT | Get order detail |
| `/api/admin/orders` | GET | Admin | List all orders |
| `/api/admin/orders` | POST | Admin | Create order |
| `/api/admin/orders/:id/status` | PATCH | Admin | Update order status |
| `/api/admin/orders/:id/payment-status` | PATCH | Admin | Update payment status |

### Packages
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/packages/:id` | GET | JWT | Get package detail |
| `/api/packages/:id/confirm` | POST | JWT | Confirm package |
| `/api/packages/:id/issue` | POST | JWT | Report exception |
| `/api/admin/packages/inbound` | POST | Admin | Create inbound package |

### Images
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/images/upload-url` | POST | Admin | Get signed upload URL |
| `/api/images/:id/signed-url` | GET | JWT | Get signed read URL |

### Shipments
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/shipments/:orderId` | GET | JWT | Get shipment |
| `/api/admin/shipments` | POST | Admin | Create shipment |

### Warehouse Address
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/warehouse-address` | GET | JWT | Get warehouse address |

## Order Status Flow

```
UNINBOUND
  ↓
INBOUNDED (at least one package arrived)
  ↓
USER_CONFIRM_PENDING (photos uploaded, awaiting user confirmation)
  ↓
REVIEW_PENDING (user confirmed, admin review)
  ↓
PAYMENT_PENDING (pricing calculated, awaiting payment)
  ↓
PAID (payment confirmed)
  ↓
READY_TO_SHIP (ready for international shipment)
  ↓
SHIPPED (tracking number assigned)
  ↓
COMPLETED (delivered and confirmed)
```

## Supabase Storage Setup

1. Create a Supabase project at https://supabase.com

2. Create the following buckets (private unless noted):
   - `package-images` (private)
   - `payment-proofs` (private)
   - `exception-images` (private)
   - `public-assets` (public)

3. Get your credentials from Settings > API:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

4. Get database connection strings from Settings > Database:
   - `DATABASE_URL` (use connection pooling for runtime)
   - `DIRECT_URL` (use direct connection for migrations)

## Deployment

### Local Docker Testing

```bash
# Build and run locally
docker-compose -f docker-compose.local.yml up --build

# Health check
curl http://localhost:3000/health
```

### Production Deployment (AWS EC2)

#### 1. Server Setup

```bash
# SSH into your EC2 instance
ssh ubuntu@<your-ec2-ip>

# Install dependencies
sudo apt update
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

#### 2. DNS Configuration

In your DNS provider (e.g., Namecheap):
```
Host: api
Type: A
Value: <EC2 Elastic IP>
TTL: Automatic
```

#### 3. Nginx Setup

```bash
sudo nano /etc/nginx/sites-available/gjxpress-api
```

Add:
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
sudo ln -s /etc/nginx/sites-available/gjxpress-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d api.gjxpress.net
```

#### 5. Deploy Application

```bash
cd ~
git clone <your-repo-url> gjxpress
cd gjxpress/backend

# Create production environment file
nano .env.production
# (Fill in all production values)

# Build and start
docker-compose -f docker-compose.production.yml up -d --build

# Run migrations
docker exec gjxpress-api npx prisma migrate deploy

# Check logs
docker logs -f gjxpress-api
```

#### 6. Verify Deployment

```bash
# Health check
curl https://api.gjxpress.net/health

# Should return:
# {"data":{"status":"ok","timestamp":"...","service":"gjxpress-api"}}
```

## WeChat Mini Program Configuration

In WeChat Mini Program admin console (https://mp.weixin.qq.com):

1. Go to: Development > Development Settings
2. Configure request domain:
   - `https://api.gjxpress.net`
3. Configure upload/download domain:
   - `https://api.gjxpress.net`

## Security Best Practices

1. **Never commit `.env.production`** - Add to `.gitignore`
2. **Keep `SUPABASE_SERVICE_ROLE_KEY` secret** - Never expose to frontend
3. **Use strong JWT secrets** - Minimum 32 characters
4. **Restrict SSH access** - Use security groups/IP whitelist
5. **Enable HTTPS only** - Redirect HTTP to HTTPS
6. **Regular updates** - Keep Node.js and dependencies updated

## Supabase Required Environment Variables

The following Supabase environment variables are required:

| Variable | How to Get | Location in Supabase |
|----------|------------|---------------------|
| `SUPABASE_URL` | Project URL | Settings > API > Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | Settings > API > Project API Keys |
| `DATABASE_URL` | Pooled connection string | Settings > Database > Connection Pooling |
| `DIRECT_URL` | Direct connection string | Settings > Database > Connection String |

## Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run build              # Build for production
npm run test               # Run tests
npm run lint               # Run linter

# Database
npx prisma migrate dev     # Create migration
npx prisma migrate deploy  # Run migrations (production)
npx prisma generate        # Generate Prisma client
npx prisma studio          # Open Prisma Studio
npx prisma db seed         # Run seed script

# Docker
docker-compose -f docker-compose.local.yml up --build
docker-compose -f docker-compose.production.yml up -d --build
docker logs -f gjxpress-api
```

## License

Private - GJXpress Logistic OS
