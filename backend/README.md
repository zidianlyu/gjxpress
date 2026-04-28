# GJXpress Backend

Logistic OS backend for 广骏供应链服务 (GJ Supply Chain Service).

## Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT + WeChat Mini Program
- **Image Storage**: Tencent COS (to be integrated)

## Project Structure

```
src/
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── admin.guard.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/              # WeChat login + JWT
├── user/              # User profile
├── order/             # Order CRUD + status flow
├── package/           # Package inbound / confirm
├── image/             # Image attachment
├── exception/         # Exception reporting
├── payment/           # Payment status management
├── shipment/          # Shipping management
├── qr/                # QR code for delivery confirm
├── notification/      # Notification queue
├── address/           # Warehouse address
└── adminlog/          # Admin operation logs
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Run database migrations
npx prisma migrate dev

# 4. Start dev server
npm run start:dev
```

## API Endpoints

| Module | Endpoint | Method | Auth |
|--------|----------|--------|------|
| Auth | `/api/auth/login` | POST | No |
| User | `/api/user/profile` | GET | JWT |
| Order | `/api/orders` | GET | JWT |
| Order | `/api/orders/:id` | GET | JWT |
| Package | `/api/packages/inbound` | POST | JWT + Admin |
| Package | `/api/packages/:id` | GET | JWT |
| Package | `/api/packages/:id/confirm` | POST | JWT |
| Image | `/api/packages/:id/images` | GET | JWT |
| Image | `/api/packages/:id/images` | POST | JWT + Admin |
| Payment | `/api/orders/:id/payment-status` | PATCH | JWT + Admin |
| Shipment | `/api/shipments` | POST | JWT + Admin |
| QR | `/api/qr/generate` | POST | JWT |
| QR | `/api/qr/scan` | POST | JWT |
| Address | `/api/address/warehouse` | GET | No |

## Environment Variables

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"
WX_APPID="wechat-app-id"
WX_SECRET="wechat-secret"
```

## Order Status Flow

```
UNINBOUND → INBOUNDED → USER_CONFIRM_PENDING → REVIEW_PENDING →
PAYMENT_PENDING → PAID → READY_TO_SHIP → SHIPPED → COMPLETED
```

## Admin Backdoor

All admin actions are logged to `AdminLog` with `manual_override` flag.

## WeChat Login Flow

1. Mini Program calls `wx.login()` → gets `code`
2. Send `code` to `POST /api/auth/login`
3. Backend calls WeChat `code2Session` → gets `openid`
4. Create/Update `User` with `openid`
5. Return JWT `access_token`

## Next Steps

1. Integrate Tencent COS for image upload
2. Add WeChat Mini Program API integration
3. Implement push notification service
4. Add logistics tracking API integration

## To Run the Project

```bash
cd /Users/zidianlyu/Desktop/gjxpress/backend

# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env with your PostgreSQL & WeChat credentials

# Run migrations
npx prisma migrate dev

# Start dev server
npm run start:dev

# Start PostgreSQL
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Start the server
npm run start:dev
```


## 数据库设置
```
-- 创建数据库
CREATE DATABASE gjxpress_dev;

-- 创建一个名为 gjadmin 的用户，并设置密码
CREATE USER gjadmin WITH PASSWORD '你的密码';

-- 将 gjxpress_dev 数据库的所有权赋予该用户
ALTER DATABASE gjxpress_dev OWNER TO gjadmin;

-- 授予用户对数据库的全部权限
GRANT ALL PRIVILEGES ON DATABASE gjxpress_dev TO gjadmin;

-- 测试连接数据库
psql -U gjadmin -d gjxpress_dev -h localhost

==== 本地运行配置
进入 PostgreSQL：
psql -U postgres -h localhost

然后执行：
ALTER USER gjadmin CREATEDB;
```
