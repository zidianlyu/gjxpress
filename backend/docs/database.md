# Backend Database Design — GJXpress Logistic OS

> Scope: Supabase Postgres + Prisma schema for `backend/`
> Storage: Supabase Storage
> ORM: Prisma
> Primary database: PostgreSQL through Supabase

---

## 1. Database Principles

1. Use PostgreSQL as the system of record.
2. Use Prisma for schema modeling and migrations.
3. Use Supabase Storage for image files.
4. Store only metadata and paths in Postgres, not binary images.
5. Use explicit enums for workflow state.
6. Use JSONB for unstable external payloads.
7. Keep business data relational.
8. Keep audit logs append-only.
9. Never expose database credentials to frontend or Mini Program.

---

## 2. Supabase + Prisma Connection Strategy

Use two connection strings:

```env
DATABASE_URL="postgresql://...pooled..."
DIRECT_URL="postgresql://...direct..."
```

Recommended Prisma datasource:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Usage:

```text
DATABASE_URL = runtime application connection
DIRECT_URL   = migration/direct connection
```

Local development:

```bash
npx prisma migrate dev
```

Production deployment:

```bash
npx prisma migrate deploy
```

Do not run `migrate dev` in production.

---

## 3. ID Strategy

Recommended primary ID type:

```text
String @id @default(cuid())
```

Reasons:

- easy to use across services
- no sequential leaking
- works well with Prisma
- readable enough for debugging

Public business numbers should be separate from database IDs.

Examples:

```text
Order.id = internal cuid
Order.orderNo = ORD-20260504-0001

Package.id = internal cuid
Package.packageNo = PKG-20260504-0001
```

---

## 4. Recommended Prisma Schema

> Windsurf may use this as the starting schema.
> Adjust names only if also updating `backend/docs/api.md`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

enum OrderStatus {
  UNINBOUND
  INBOUNDED
  USER_CONFIRM_PENDING
  REVIEW_PENDING
  PAYMENT_PENDING
  PAID
  READY_TO_SHIP
  SHIPPED
  COMPLETED
  EXCEPTION
  CANCELLED
}

enum PackageStatus {
  CREATED
  INBOUNDED
  USER_CONFIRM_PENDING
  CONFIRMED
  EXCEPTION
  CONSOLIDATED
  SHIPPED
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  PROCESSING
  PAID
  REFUNDED
  WAIVED
}

enum SourcePlatform {
  TAOBAO
  JD
  PINDUODUO
  OTHER
}

enum ImageType {
  OUTER
  LABEL
  INNER
  EXCEPTION
  PAYMENT_PROOF
  OTHER
}

enum ImageStatus {
  CREATED
  UPLOADED
  DELETED
}

enum ExceptionType {
  MISSING_ITEM
  WRONG_ITEM
  DAMAGED
  RESTRICTED
  OTHER
}

enum ExceptionStatus {
  OPEN
  PROCESSING
  RESOLVED
  CANCELLED
}

enum ShipmentProvider {
  UPS
  DHL
  EMS
  USPS
  FEDEX
  SEA
  AIR
  OTHER
}

enum ShipmentStatus {
  CREATED
  READY
  SHIPPED
  IN_TRANSIT
  DELIVERED
  EXCEPTION
  CANCELLED
}

enum QrPurpose {
  RECEIPT_CONFIRMATION
  PICKUP_CONFIRMATION
}

enum AdminActionTargetType {
  ORDER
  PACKAGE
  PAYMENT
  SHIPMENT
  EXCEPTION
  IMAGE
  USER
  ADMIN
  SYSTEM
}

enum RecommendationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model User {
  id        String   @id @default(cuid())
  openid    String   @unique
  unionid   String?
  nickname  String?
  avatarUrl String?
  userCode  String   @unique
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)

  orders        Order[]
  qrScanLogs    QrScanLog[]
  notifications Notification[]
  addressUsages AddressUsage[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userCode])
  @@index([createdAt])
}

model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  displayName  String?
  role         UserRole @default(ADMIN)
  isActive     Boolean  @default(true)

  inboundRecords InboundRecord[]
  actionLogs     AdminActionLog[]
  shipments      Shipment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([role])
  @@index([isActive])
}

model Order {
  id            String        @id @default(cuid())
  orderNo       String        @unique
  userId        String
  user          User          @relation(fields: [userId], references: [id])

  status        OrderStatus   @default(UNINBOUND)
  paymentStatus PaymentStatus @default(UNPAID)

  totalActualWeight Decimal? @db.Decimal(10, 2)
  totalVolumeWeight Decimal? @db.Decimal(10, 2)
  chargeableWeight  Decimal? @db.Decimal(10, 2)
  estimatedPrice    Decimal? @db.Decimal(10, 2)
  finalPrice        Decimal? @db.Decimal(10, 2)
  currency          String   @default("USD")

  manualOverride Boolean @default(false)
  adminRemark    String?
  userRemark     String?

  packages       Package[]
  paymentRecords PaymentRecord[]
  shipment       Shipment?
  qrCodes        QrCode[]
  exceptions     ExceptionCase[]
  statusLogs     OrderStatusLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([orderNo])
  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
}

model Package {
  id                 String         @id @default(cuid())
  packageNo          String         @unique
  orderId            String
  order              Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)

  domesticTrackingNo String?
  sourcePlatform     SourcePlatform @default(OTHER)
  status             PackageStatus  @default(CREATED)

  actualWeight Decimal? @db.Decimal(10, 2)
  lengthCm     Decimal? @db.Decimal(10, 2)
  widthCm      Decimal? @db.Decimal(10, 2)
  heightCm     Decimal? @db.Decimal(10, 2)
  volumeWeight Decimal? @db.Decimal(10, 2)

  inboundAt       DateTime?
  userConfirmedAt DateTime?
  remark          String?

  goodsItems      GoodsItem[]
  images          PackageImage[]
  inboundRecords  InboundRecord[]
  exceptions      ExceptionCase[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId])
  @@index([packageNo])
  @@index([domesticTrackingNo])
  @@index([status])
  @@index([inboundAt])
}

model GoodsItem {
  id        String  @id @default(cuid())
  packageId String
  package   Package @relation(fields: [packageId], references: [id], onDelete: Cascade)

  name                  String?
  category              String?
  quantity              Int     @default(1)
  containsSensitiveItem Boolean @default(false)
  remark                String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([packageId])
  @@index([category])
}

model PackageImage {
  id        String  @id @default(cuid())
  packageId String?
  package   Package? @relation(fields: [packageId], references: [id], onDelete: SetNull)

  imageType ImageType
  status    ImageStatus @default(CREATED)

  bucket      String
  storagePath String
  publicUrl   String?
  mimeType    String?
  sizeBytes   Int?
  checksum    String?

  uploadedByUserId  String?
  uploadedByAdminId String?

  createdAt  DateTime @default(now())
  uploadedAt DateTime?
  deletedAt  DateTime?

  @@index([packageId])
  @@index([imageType])
  @@index([status])
  @@index([storagePath])
}

model InboundRecord {
  id        String  @id @default(cuid())
  packageId String
  package   Package @relation(fields: [packageId], references: [id], onDelete: Cascade)

  operatorAdminId String
  operatorAdmin   Admin @relation(fields: [operatorAdminId], references: [id])

  checkResult String?
  remark      String?
  inboundTime DateTime @default(now())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([packageId])
  @@index([operatorAdminId])
  @@index([inboundTime])
}

model PaymentRecord {
  id      String @id @default(cuid())
  orderId String
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  paymentStatus PaymentStatus
  paymentMethod String?
  amount        Decimal? @db.Decimal(10, 2)
  currency      String   @default("USD")
  proofImageId  String?
  remark        String?

  confirmedByAdminId String?
  confirmedAt        DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId])
  @@index([paymentStatus])
  @@index([confirmedAt])
}

model Shipment {
  id      String @id @default(cuid())
  orderId String @unique
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  provider          ShipmentProvider
  trackingNumber    String?
  status            ShipmentStatus @default(CREATED)
  shippedAt         DateTime?
  estimatedArrivalAt DateTime?

  rawPayload Json?

  createdByAdminId String?
  createdByAdmin   Admin? @relation(fields: [createdByAdminId], references: [id])

  events LogisticsTrackingEvent[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([provider])
  @@index([trackingNumber])
  @@index([status])
  @@index([shippedAt])
}

model LogisticsTrackingEvent {
  id         String   @id @default(cuid())
  shipmentId String
  shipment   Shipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)

  eventStatus   String?
  eventLocation String?
  description   String?
  eventTime     DateTime?
  rawPayload    Json?

  createdAt DateTime @default(now())

  @@index([shipmentId])
  @@index([eventTime])
}

model QrCode {
  id      String @id @default(cuid())
  orderId String
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  tokenHash String
  purpose   QrPurpose
  expiresAt DateTime
  isUsed    Boolean  @default(false)
  usedAt    DateTime?

  scanLogs QrScanLog[]

  createdAt DateTime @default(now())

  @@index([orderId])
  @@index([tokenHash])
  @@index([expiresAt])
}

model QrScanLog {
  id       String @id @default(cuid())
  qrCodeId String
  qrCode   QrCode @relation(fields: [qrCodeId], references: [id], onDelete: Cascade)

  scanUserId String?
  scanUser   User? @relation(fields: [scanUserId], references: [id])

  isAuthorized Boolean
  result       String?
  ipAddress    String?
  userAgent    String?

  scannedAt DateTime @default(now())

  @@index([qrCodeId])
  @@index([scanUserId])
  @@index([scannedAt])
}

model ExceptionCase {
  id        String @id @default(cuid())
  orderId   String
  order     Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  packageId String?
  package   Package? @relation(fields: [packageId], references: [id], onDelete: SetNull)

  type        ExceptionType
  status      ExceptionStatus @default(OPEN)
  description String?
  resolution  String?

  createdByUserId  String?
  createdByAdminId String?

  resolvedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([orderId])
  @@index([packageId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}

model AdminActionLog {
  id      String @id @default(cuid())
  adminId String
  admin   Admin  @relation(fields: [adminId], references: [id])

  targetType  AdminActionTargetType
  targetId    String
  action      String
  beforeState Json?
  afterState  Json?
  reason      String?

  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  @@index([adminId])
  @@index([targetType, targetId])
  @@index([action])
  @@index([createdAt])
}

model OrderStatusLog {
  id      String @id @default(cuid())
  orderId String
  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)

  fromStatus OrderStatus?
  toStatus   OrderStatus
  changedByType String
  changedById   String?
  reason        String?

  createdAt DateTime @default(now())

  @@index([orderId])
  @@index([toStatus])
  @@index([createdAt])
}

model AddressUsage {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  warehouseAddressId String?
  copiedAt           DateTime @default(now())

  @@index([userId])
  @@index([copiedAt])
}

model WarehouseAddress {
  id           String  @id @default(cuid())
  name         String
  receiverName String
  phone        String
  country      String  @default("中国")
  province     String
  city         String
  district     String?
  addressLine  String
  postalCode   String?
  isActive     Boolean @default(true)
  remark       String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive])
}

model Notification {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      String
  title     String?
  body      String?
  payload   Json?
  isRead    Boolean @default(false)
  sentAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([type])
  @@index([isRead])
  @@index([createdAt])
}

model Recommendation {
  id      String @id @default(cuid())
  slug    String @unique
  title   String
  summary String?
  body    String?

  category String?
  city     String?
  tags     String[] @default([])

  status RecommendationStatus @default(DRAFT)

  seoTitle       String?
  seoDescription String?

  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([status])
  @@index([category])
  @@index([city])
  @@index([publishedAt])
}
```

---

## 5. Model Notes

## 5.1 User

`openid` is unique and private.

`userCode` must be 4 digits in V1.

Generation strategy:

1. Generate random number `1000` to `9999`.
2. Check uniqueness.
3. Retry until unique.
4. If capacity becomes an issue, expand to 5 or 6 digits.

Important:

```text
userCode is not an auth credential.
```

## 5.2 Admin

Store `passwordHash`, never raw password.

Recommended hash:

```text
bcrypt
```

Admin creation can initially be done through seed script.

## 5.3 Order

`orderNo` is public-facing.

Recommended format:

```text
ORD-YYYYMMDD-0001
```

`manualOverride` becomes true when admin bypasses normal payment/status rules.

## 5.4 Package

`domesticTrackingNo` is optional but highly recommended.

If an inbound package is received without existing order:

- backend may create a new order automatically
- or require admin to choose user first

Recommended V1:

```text
Admin enters userCode. Backend finds user. Backend creates order if no open order exists.
```

## 5.5 PackageImage

Use `storagePath` as canonical storage reference.

Do not rely only on public URL because bucket policy may change.

## 5.6 PaymentRecord

Each payment status change should create a record.

This creates auditability even without integrated payment provider.

## 5.7 Shipment

`rawPayload` stores future UPS/DHL/EMS API data.

V1 can keep it null.

## 5.8 AdminActionLog

Append-only.

Do not delete logs in normal operation.

## 5.9 Recommendation

Used by Next.js SEO frontend.

Keep separate from logistics data.

---

## 6. Index Strategy

Minimum indexes already included in schema.

Important query patterns:

```text
User by userCode
Order by userId
Order by orderNo
Order by status/paymentStatus
Package by packageNo
Package by domesticTrackingNo
Package by orderId
Exception by status
Shipment by trackingNumber
Recommendation by slug/status/city/category
```

---

## 7. Storage Design

## 7.1 Supabase Buckets

Recommended buckets:

```text
package-images
payment-proofs
exception-images
public-assets
```

## 7.2 Bucket Access

MVP recommendation:

```text
package-images: private
payment-proofs: private
exception-images: private
public-assets: public
```

Clients receive:

- signed upload URLs for upload
- signed read URLs for private images

## 7.3 Storage Paths

Recommended path format:

```text
packages/{packageId}/{imageType}/{timestamp}_{uuid}.{ext}
payment-proofs/{orderId}/{timestamp}_{uuid}.{ext}
exceptions/{exceptionId}/{timestamp}_{uuid}.{ext}
recommendations/{recommendationId}/{filename}
```

Examples:

```text
packages/clxabc123/OUTER/20260504_550e8400.jpg
packages/clxabc123/LABEL/20260504_0f4d2a11.jpg
```

## 7.4 Image Metadata Flow

1. Client asks backend for upload URL.
2. Backend creates `PackageImage` with `CREATED`.
3. Backend creates signed upload URL in Supabase.
4. Client uploads image.
5. Client calls complete endpoint.
6. Backend marks image `UPLOADED`.

## 7.5 Content Type Validation

Allowed:

```text
image/jpeg
image/png
image/webp
```

Recommended max size:

```text
10 MB per image for V1
```

Admin UI may compress before upload later.

---

## 8. Migration Strategy

## 8.1 Naming

Use descriptive migration names.

Examples:

```bash
npx prisma migrate dev --name init_logistic_os_schema
npx prisma migrate dev --name add_recommendation_module
npx prisma migrate dev --name add_qr_code_tables
```

## 8.2 Development

```bash
npx prisma migrate dev
npx prisma generate
```

## 8.3 Production

```bash
npx prisma migrate deploy
npx prisma generate
```

## 8.4 Reset

Only in local dev:

```bash
npx prisma migrate reset
```

Never use reset in production.

---

## 9. Seed Strategy

Add seed script for local/dev.

Seed should create:

1. One admin.
2. Two users.
3. Several orders.
4. Several packages.
5. Package images with mock paths.
6. Payment states.
7. Shipments.
8. Exceptions.
9. Recommendations.

Recommended command:

```bash
npx prisma db seed
```

Example `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 10. Data Access Rules

Backend enforces access.

## 10.1 User

Can access:

```text
own profile
own orders
own packages
own shipments
own QR scan actions
```

Cannot access:

```text
other users' data
admin logs
all orders
raw openid
payment records beyond displayable status
```

## 10.2 Admin

Can access:

```text
all logistics records
all package records
all exceptions
all shipments
admin logs
```

## 10.3 Public

Can access:

```text
published recommendations only
health endpoint
```

---

## 11. RLS Considerations

Since NestJS backend is the main data access layer and uses server-side credentials, V1 may rely on backend authorization rather than Supabase Row Level Security.

Recommended V1:

```text
Do not expose Supabase anon database access to clients.
Do not let clients query Supabase tables directly.
Use backend service role carefully.
```

If later building direct Supabase client flows, enable RLS and define policies.

---

## 12. JSON Fields

Use JSON fields for unstable data:

```text
Shipment.rawPayload
LogisticsTrackingEvent.rawPayload
AdminActionLog.beforeState
AdminActionLog.afterState
Notification.payload
```

Do not use JSON for core relational fields like:

```text
order status
payment status
package weight
user ID
shipment tracking number
```

---

## 13. Database-Level Constraints

Recommended:

- unique `User.openid`
- unique `User.userCode`
- unique `Order.orderNo`
- unique `Package.packageNo`
- unique `Recommendation.slug`
- one shipment per order in V1 via `Shipment.orderId @unique`

Potential future changes:

- allow multiple shipments per order
- add consolidation group
- add warehouse table
- add pricing rule table

---

## 14. Future Tables

Not required in V1 but likely later:

```text
PricingRule
Warehouse
ConsolidationGroup
LogisticsProviderCredential
CustomsDeclaration
ReferralCode
CustomerSupportTicket
```

Do not add until needed.

---

## 15. Data Backup

Supabase provides platform-level database management, but project should still define backup expectations.

Recommended operational policy:

```text
Before major migration, export backup.
Before destructive changes, test migration on dev project.
Keep migration files committed.
```

---

## 16. Phase 3 — CustomerRegistration & Customer.domesticReturnAddress

### 16.1 Customer.domesticReturnAddress

Added optional `TEXT` column `domestic_return_address` to the `customers` table.

- Prisma field: `domesticReturnAddress String? @map("domestic_return_address") @db.Text`
- Admin-only visibility. Not exposed to Public endpoints.
- Settable on create (`POST /admin/customers`) and update (`PATCH /admin/customers/:id`).
- Also copied from `CustomerRegistration` on approval.

### 16.2 CustomerRegistrationStatus Enum

```sql
CREATE TYPE "CustomerRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
```

### 16.3 CustomerRegistration Table

Table: `customer_registrations`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | auto |
| `customer_code` | VARCHAR(16) UNIQUE | GJ + 4 digits, generated at submission time |
| `phone_country_code` | VARCHAR(8) | default +86 |
| `phone_number` | VARCHAR(32) | required |
| `wechat_id` | VARCHAR(64) nullable | |
| `domestic_return_address` | TEXT nullable | |
| `notes` | TEXT nullable | |
| `status` | CustomerRegistrationStatus | default PENDING |
| `approved_at` | TIMESTAMP nullable | |
| `approved_by_admin_id` | UUID nullable | admin who approved |
| `rejected_at` | TIMESTAMP nullable | |
| `rejected_by_admin_id` | UUID nullable | admin who rejected |
| `review_note` | TEXT nullable | internal note |
| `created_customer_id` | UUID nullable FK→customers(id) SET NULL | set after approve |
| `ip_hash` | VARCHAR(128) nullable | hashed IP for audit |
| `user_agent` | VARCHAR(512) nullable | browser UA |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

FK: `created_customer_id` → `customers.id` ON DELETE SET NULL (deleting registration does NOT delete Customer)

### 16.4 customerCode Generation Rules

- Format: `GJ` + exactly 4 numeric digits (e.g. `GJ0427`)
- Range: `GJ1000`–`GJ9999` (3rd-4th digit always `Math.floor(1000 + random * 9000)`)
- Uniqueness check: simultaneously queries both `Customer.customerCode` and `CustomerRegistration.customerCode`
- Max retries: 50 before throwing `400 "Customer code pool exhausted or collision too high."`
- Pool size: ~9000 codes. If pool is exhausted in future, format can be extended to 5 digits — update `VarChar(16)` column and regex
- customerCode is NOT a login credential. Used only for customer identification and package attribution.

### 16.5 Approve Transaction Logic

`POST /admin/customer-registrations/:id/approve` uses a single `$transaction`:

1. Check registration exists + not already APPROVED
2. Check phone not already a formal Customer (409)
3. Check customerCode not already in Customer table (409 — should never happen but defensive)
4. `tx.customer.create(...)` — copies customerCode, phoneCountryCode, phoneNumber, wechatId, domesticReturnAddress, notes; status=ACTIVE
5. `tx.customerRegistration.update(...)` — status=APPROVED, approvedAt=now, approvedByAdminId, createdCustomerId=customer.id, reviewNote

### 16.6 Duplicate Submission Policy

| Existing state | Re-submit result |
|---|---|
| PENDING same phone | 409 — 该手机号已有待审核申请 |
| APPROVED same phone | 409 — 该手机号已关联正式客户 |
| Already formal Customer | 409 — 该手机号已登记为正式客户 |
| REJECTED same phone | Allowed — new submission creates new registration with new customerCode |

### 16.7 Hard Delete Behaviour

- Hard delete `CustomerRegistration` removes the row only.
- `customers.created_customer_id` FK uses `ON DELETE SET NULL` — the formal Customer is unaffected.
- `confirm=DELETE_HARD` required; 400 otherwise.

### 16.8 Privacy

- Public `POST /public/customer-registrations` response returns only: `id`, `customerCode`, `status`, `message`
- Never returns: ipHash, userAgent, reviewNote, approvedByAdminId, rejectedByAdminId, other registrations' data
- Backend request log does not include phoneNumber, wechatId, or domesticReturnAddress in log output
- Rate limit and CAPTCHA not implemented yet. Recommended for production: add rate limit per IP on `POST /public/customer-registrations`

### 16.9 Migration

File: `prisma/migrations/20260506024953_customer_registration_review/migration.sql`

Operations:
- `CREATE TYPE "CustomerRegistrationStatus"`
- `ALTER TABLE "customers" ADD COLUMN "domestic_return_address" TEXT`
- `CREATE TABLE "customer_registrations"` with all columns and indexes
- `ADD CONSTRAINT` FK to customers

---

## 17. Admin Contract Cleanup — Customers, Inbound Packages, Customer Shipments

Migration file: `prisma/migrations/20260506121000_simplify_admin_statuses_and_fix_lists/migration.sql`

Mode: create-only / review-only. It has not been applied automatically to the Supabase database.

### 17.1 customerId vs customerCode

- `customers.id` is the internal UUID primary key.
- `customers.customer_code` is the business-facing code, e.g. `GJ3178`.
- `inbound_packages.customer_id` remains a nullable UUID foreign key to `customers.id`.
- Admin APIs accept `customerCode` for package attribution, resolve it to `Customer.id` in service code, and persist only the UUID FK.
- API responses include nested `customer.customerCode` so frontend never needs to display a UUID as the customer number.

### 17.2 InboundPackage

Table: `inbound_packages`

| Column | Type | Notes |
|---|---|---|
| `domestic_tracking_no` | `VARCHAR(64) NULL UNIQUE` | Optional; Postgres allows multiple NULLs, duplicate non-null values return 409 in API |
| `customer_id` | `UUID NULL FK -> customers(id)` | Internal FK resolved from Admin `customerCode` input |
| `status` | `InboundPackageStatus` | Simplified business enum |
| `image_urls` | `TEXT[] DEFAULT []` | Public image URLs stored after admin upload |

`InboundPackageStatus` values:

| Value | Label | Notes |
|---|---|---|
| `UNIDENTIFIED` | 未识别 | No customerCode/customerId yet |
| `ARRIVED` | 已入库 | Customer is known or package is in warehouse flow |
| `CONSOLIDATED` | 已合箱 | Package has been added to a customer shipment |

Migration status mapping:

| Old value | New value |
|---|---|
| `UNCLAIMED`, `PREALERTED_NOT_ARRIVED` | `UNIDENTIFIED` |
| `CLAIMED`, `ARRIVED_WAREHOUSE`, `PENDING_CONFIRMATION`, `CONFIRMED`, `ISSUE_REPORTED`, `INBOUND_EXCEPTION` | `ARRIVED` |
| `CONSOLIDATED` | `CONSOLIDATED` |

### 17.3 CustomerShipment

Table: `customer_shipments`

| Column | Type | Notes |
|---|---|---|
| `quantity` | `INTEGER NOT NULL DEFAULT 1` | Piece count entered by admin |
| `status` | `CustomerShipmentStatus` | Simplified business enum |
| `actual_weight_kg` | `DECIMAL(10,3) NULL` | Billing input |
| `volume_formula` | `VARCHAR(128) NULL` | Human-readable formula |
| `billing_rate_cny_per_kg` | `DECIMAL(10,2) NULL` | Billing input |
| `billing_weight_kg` | `DECIMAL(10,3) NULL` | Billing input |
| `image_urls` | `TEXT[] DEFAULT []` | Admin-uploaded images |

`CustomerShipmentStatus` values:

| Value | Label | Timestamp field currently reused |
|---|---|---|
| `PACKED` | 已打包 | none |
| `SHIPPED` | 已发货 | `sent_to_overseas_at` |
| `ARRIVED` | 已到达 | `arrived_overseas_at` |
| `READY_FOR_PICKUP` | 待自提 | `local_delivery_requested_at` |
| `PICKED_UP` | 已取货 | `picked_up_at` |
| `EXCEPTION` | 异常 | none |

Migration status mapping:

| Old value | New value |
|---|---|
| `DRAFT`, `PACKED` | `PACKED` |
| `SENT_TO_OVERSEAS` | `SHIPPED` |
| `ARRIVED_OVERSEAS` | `ARRIVED` |
| `READY_FOR_PICKUP`, `LOCAL_DELIVERY_REQUESTED`, `LOCAL_DELIVERY_IN_PROGRESS` | `READY_FOR_PICKUP` |
| `PICKED_UP`, `COMPLETED` | `PICKED_UP` |
| `EXCEPTION` | `EXCEPTION` |

**Status: create-only (not yet applied)**. Apply with:
```bash
npx prisma migrate deploy
```
After backing up the database.

---

## 17. Windsurf Implementation Checklist

When implementing database:

1. Create/update `prisma/schema.prisma`.
2. Use enums exactly as defined unless API docs are updated.
3. Generate migration with descriptive name.
4. Add seed script.
5. Add Prisma service in NestJS.
6. Add calculation helpers for volume weight.
7. Add transaction helpers for status updates.
8. Ensure admin logs are created inside same transaction where possible.
9. Ensure user ownership checks use relational queries.
10. Ensure image metadata flow is implemented.
