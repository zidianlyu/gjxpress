# Web Logistics Phase 1 — Implementation Notes

> Scope: Backend only. No frontend, no miniprogram, no SMS, no payment integration.
> Base prefix: `/api`
> Auth: JWT Bearer token required for Admin APIs. No auth for Public APIs.

---

## 1. New Database Models

### 1.1 AdminAccount
Phone-based admin accounts with bcrypt password hashing.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| phoneCountryCode | VARCHAR(8) | default `+86` |
| phoneNumber | VARCHAR(32) | unique with countryCode |
| passwordHash | TEXT | bcrypt(cost=12) |
| role | AdminRole | OWNER/ADMIN/WAREHOUSE_STAFF/US_STAFF/VIEWER |
| status | AdminStatus | ACTIVE/DISABLED |
| displayName | VARCHAR(64) | optional |
| lastLoginAt | TIMESTAMP | auto-updated on login |

### 1.2 Customer
Web-facing customers with auto-generated `customerCode` (`GJ` + 4 digits).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| customerCode | VARCHAR(16) | unique, format GJ1234 |
| phoneCountryCode | VARCHAR(8) | default `+86` |
| phoneNumber | VARCHAR(32) | unique with countryCode |
| displayName | VARCHAR(64) | optional |
| notes | TEXT | internal notes |
| status | CustomerStatus | ACTIVE/DISABLED |

### 1.3 InboundPackage
Packages received at the China warehouse.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| domesticTrackingNo | VARCHAR(64) | unique, optional |
| customerId | UUID? | FK to Customer, nullable if unclaimed |
| status | InboundPackageStatus | see enum |
| warehouseReceivedAt | TIMESTAMP | |
| weightKg | DECIMAL(10,3) | |
| lengthCm/widthCm/heightCm | DECIMAL(10,2) | |
| volumeCm3 | DECIMAL(12,2) | auto-calculated |
| labelImageUrl | TEXT | |
| packageImageUrls | JSONB | array of URLs |
| issueNote/adminNote | TEXT | |

### 1.4 CustomerShipment
One shipment per customer (multiple inbound packages consolidated).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| shipmentNo | VARCHAR(32) | unique, format GJS20260504123 |
| customerId | UUID | FK to Customer |
| masterShipmentId | UUID? | FK to MasterShipment |
| status | CustomerShipmentStatus | see enum |
| paymentStatus | PaymentStatus | |
| internationalTrackingNo | VARCHAR(128) | |
| publicTrackingEnabled | BOOLEAN | default true |
| sentToOverseasAt / arrivedOverseasAt / ... | TIMESTAMP | lifecycle timestamps |

### 1.5 CustomerShipmentItem
Join table: CustomerShipment ↔ InboundPackage (1 package can only be in 1 shipment).

### 1.6 MasterShipment
Batch/freight shipment grouping multiple CustomerShipments.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| batchNo | VARCHAR(32) | unique, format GJB20260504123 |
| vendorName/vendorTrackingNo | VARCHAR | freight vendor info |
| status | MasterShipmentStatus | see enum |
| publicVisible | BOOLEAN | default false; controls public feed |
| publicTitle/publicSummary/publicStatusText | TEXT | public announcement fields |
| publishedAt | TIMESTAMP | set when publicVisible first set to true |

### 1.7 TransactionRecord
Financial records for customers.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| customerId | UUID | FK to Customer |
| customerShipmentId | UUID? | FK to CustomerShipment |
| type | TransactionType | SERVICE_FEE/SHIPPING_FEE/LOCAL_DELIVERY_FEE/ADJUSTMENT/REFUND/OTHER |
| amountCents | INT | amount in cents |
| currency | VARCHAR(8) | default USD |
| paymentStatus | PaymentStatus | |
| occurredAt | TIMESTAMP | default now() |

---

## 2. New Enums

| Enum | Values |
|------|--------|
| AdminRole | OWNER, ADMIN, WAREHOUSE_STAFF, US_STAFF, VIEWER |
| AdminStatus | ACTIVE, DISABLED |
| CustomerStatus | ACTIVE, DISABLED |
| InboundPackageStatus | UNCLAIMED, CLAIMED, PREALERTED_NOT_ARRIVED, ARRIVED_WAREHOUSE, PENDING_CONFIRMATION, CONFIRMED, ISSUE_REPORTED, CONSOLIDATED, INBOUND_EXCEPTION |
| CustomerShipmentStatus | DRAFT, PACKED, SENT_TO_OVERSEAS, ARRIVED_OVERSEAS, READY_FOR_PICKUP, LOCAL_DELIVERY_REQUESTED, LOCAL_DELIVERY_IN_PROGRESS, PICKED_UP, COMPLETED, EXCEPTION |
| MasterShipmentStatus | CREATED, HANDED_TO_VENDOR, IN_TRANSIT, TRANSFER_OR_CUSTOMS_PROCESSING, ARRIVED_OVERSEAS, CLOSED, EXCEPTION |
| TransactionType | SERVICE_FEE, SHIPPING_FEE, LOCAL_DELIVERY_FEE, ADJUSTMENT, REFUND, OTHER |

PaymentStatus extended: added `PENDING` value.

---

## 3. Migration

- **File:** `prisma/migrations/20260505061222_web_logistics_phase_1/migration.sql`
- **Mode:** create-only (not yet applied to production)
- **Safety:** Contains only `CREATE TABLE`, `CREATE INDEX`, `CREATE TYPE`, `ALTER TYPE ADD VALUE`, `ADD FOREIGN KEY`, `RENAME INDEX` — no destructive SQL.
- **Apply to production:**
  ```bash
  npx prisma migrate deploy
  ```

---

## 4. Auth Changes

### POST /api/auth/admin-login

Supports two login modes, selected by which fields are provided:

**Mode A — Phone login (AdminAccount, new):**
```json
{
  "phoneCountryCode": "+86",
  "phoneNumber": "13800000000",
  "password": "..."
}
```
- Looks up `AdminAccount` by `(phoneCountryCode, phoneNumber)`
- Verifies password with `bcrypt.compare`
- JWT payload: `{ sub, type: 'ADMIN', role, authModel: 'AdminAccount' }`
- Updates `lastLoginAt` on success

**Mode B — Username login (Admin model, legacy backward compat):**
```json
{
  "username": "admin",
  "password": "..."
}
```
- Looks up `Admin` by `username`
- Verifies password with SHA-256 (legacy)
- JWT payload: `{ sub, type: 'ADMIN', role, authModel: 'Admin' }`

`JwtStrategy.validate()` routes by `authModel` claim.

### Creating AdminAccount (bootstrap script)
```bash
ADMIN_BOOTSTRAP_PHONE_NUMBER=13800000000 \
ADMIN_BOOTSTRAP_PASSWORD=YourStrongPassword12 \
ADMIN_BOOTSTRAP_ROLE=OWNER \
ADMIN_BOOTSTRAP_DISPLAY_NAME="Super Admin" \
npm run admin:create
```
- Never hardcode phone numbers or passwords in source code.
- Password minimum length: 12 characters.

---

## 5. New Admin APIs

All require `Authorization: Bearer <token>` where token is from `POST /api/auth/admin-login`.

### 5.1 Customers `/api/admin/customers`
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/admin/customers | Create customer (auto-generates GJ1234 code) |
| GET | /api/admin/customers | List with search (q, status) + pagination |
| GET | /api/admin/customers/:id | Detail with recent packages + shipments |
| PATCH | /api/admin/customers/:id | Update phone, name, notes, status |

### 5.2 InboundPackages `/api/admin/inbound-packages`
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/admin/inbound-packages | Create (auto-binds by customerCode if provided) |
| GET | /api/admin/inbound-packages | List with search (q, status, customerId) |
| GET | /api/admin/inbound-packages/:id | Detail with customer + shipment info |
| PATCH | /api/admin/inbound-packages/:id/assign-customer | Assign customer by customerCode |
| PATCH | /api/admin/inbound-packages/:id/status | Update status |
| PATCH | /api/admin/inbound-packages/:id/measurements | Update weight/dimensions (auto-calculates volumeCm3) |

### 5.3 CustomerShipments `/api/admin/customer-shipments`
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/admin/customer-shipments | Create (optionally with inboundPackageIds) |
| GET | /api/admin/customer-shipments | List with filter (q, status, paymentStatus, customerId, masterShipmentId) |
| GET | /api/admin/customer-shipments/:id | Detail with items + transactions |
| PATCH | /api/admin/customer-shipments/:id/status | Update status (auto-sets lifecycle timestamps) |
| PATCH | /api/admin/customer-shipments/:id/payment-status | Update paymentStatus |
| POST | /api/admin/customer-shipments/:id/items | Add inbound package to shipment |
| DELETE | /api/admin/customer-shipments/:id/items/:itemId | Remove inbound package (blocked for shipped statuses) |

### 5.4 MasterShipments `/api/admin/master-shipments`
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/admin/master-shipments | Create batch |
| GET | /api/admin/master-shipments | List with filter (q, status, publicVisible) |
| GET | /api/admin/master-shipments/:id | Detail with all customer shipments |
| PATCH | /api/admin/master-shipments/:id/status | Update status (auto-sets timestamps) |
| POST | /api/admin/master-shipments/:id/customer-shipments | Add customer shipments to batch |
| DELETE | /api/admin/master-shipments/:id/customer-shipments/:csId | Remove customer shipment from batch |
| PATCH | /api/admin/master-shipments/:id/publication | Set publicVisible + public announcement text |

### 5.5 Transactions `/api/admin/transactions`
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/admin/transactions | Create transaction record |
| GET | /api/admin/transactions | List with filter (customerId, customerShipmentId, type, paymentStatus) |
| GET | /api/admin/transactions/:id | Detail |
| PATCH | /api/admin/transactions/:id | Update paymentStatus, amountCents, notes |

---

## 6. New Public APIs (No Auth)

### GET /api/public/tracking/:shipmentNo
- Returns tracking info for a customer shipment by `shipmentNo`
- Returns `{ found: false, message: 'NO_RECORD' }` if not found or `publicTrackingEnabled = false`
- **No PII exposed:** no customer name, phone, address
- Returns: status, Chinese status label, stage label, timeline timestamps, batch info (if publicVisible)

**Privacy guarantees:**
- `customerId`, `customer.phoneNumber`, `customer.displayName` are never included
- `internationalTrackingNo` is not included in public response
- Only returns data if `publicTrackingEnabled = true`

### GET /api/public/batch-updates
- Returns paginated list of publicly visible master shipments (`publicVisible = true`)
- Returns: batchNo, Chinese status label, publicTitle, publicSummary, publicStatusText, timestamps
- **No PII:** no customer data, no internal admin notes

---

## 7. Chinese Status Labels

Source: `src/common/status-labels.ts`

| Status | Chinese Label |
|--------|--------------|
| UNCLAIMED | 待识别 |
| ARRIVED_WAREHOUSE | 已入库 |
| CONSOLIDATED | 已合箱 |
| SENT_TO_OVERSEAS | 已发往海外仓 |
| ARRIVED_OVERSEAS | 已到达海外仓 |
| READY_FOR_PICKUP | 待自提 |
| LOCAL_DELIVERY_IN_PROGRESS | 本地递送中 |
| PICKED_UP | 收件人已取货 |
| COMPLETED | 已完成 |
| HANDED_TO_VENDOR | 已交供应商 |
| IN_TRANSIT | 运输中 |

---

## 8. Old API Compatibility

The following existing endpoints are **unchanged** and remain fully operational:

- `POST /api/auth/wechat-login` — WeChat Mini Program login
- `POST /api/auth/admin-login` — still works with `username` + `password` (legacy Admin model)
- `GET /api/orders`, `POST /api/orders/*` — mini program order APIs
- `GET /api/packages`, `POST /api/packages/*` — mini program package APIs
- `GET /api/warehouse-address/*` — warehouse address APIs
- All existing `/api/admin/*` endpoints (users, orders, packages, exceptions, shipments, QR codes, notifications, action logs, recommendations)
- `GET /api/public/recommendations`, `GET /api/public/recommendations/:slug`

---

## 9. Security Notes

- `bcryptjs` (cost=12) used for `AdminAccount.passwordHash`
- Legacy `Admin` model still uses SHA-256 for backward compat — migrate admin accounts to `AdminAccount` over time
- Public tracking API strips all PII before responding
- `AdminGuard` checks `user.type === 'ADMIN'` on all admin routes
- No secrets, phone numbers, or password hashes in source code

---

## 10. Subsequent Operations Required

Before production deployment:

```bash
# 1. Review migration SQL (non-destructive check)
cat prisma/migrations/20260505061222_web_logistics_phase_1/migration.sql

# 2. Apply migration to production DB
npx prisma migrate deploy

# 3. Regenerate Prisma client (already done, for Docker build)
npx prisma generate

# 4. Build
npm run build

# 5. Create first AdminAccount (replace values, never commit real data)
ADMIN_BOOTSTRAP_PHONE_NUMBER=XXXXX \
ADMIN_BOOTSTRAP_PASSWORD=XXXXX \
ADMIN_BOOTSTRAP_ROLE=OWNER \
npm run admin:create

# 6. Rebuild and redeploy Docker image
```

---

## 11. Acceptance Checklist

- [ ] `GET /api/health` returns 200
- [ ] `POST /api/auth/admin-login` with phone returns token
- [ ] `POST /api/auth/admin-login` with username still works (legacy)
- [ ] `GET /api/admin/customers` requires token → 401 without token
- [ ] `GET /api/public/tracking/XXXXX` returns NO_RECORD (no token needed)
- [ ] `GET /api/public/batch-updates` returns empty list (no token needed)
- [ ] `npm run build` passes with 0 errors ✅
- [ ] Migration SQL has no DROP TABLE / TRUNCATE ✅
- [ ] Old mini program APIs (`/api/orders`, `/api/packages`) still accessible

---

## 12. Phase 1 Completion Audit — Admin Core CRUD (Session 2)

### 12.1 Scope Expanded

Phase 1 Admin API now fully covers 5 resources:

| Resource | Description |
|---|---|
| Customer | 客户档案 — CRUD + soft disable + hard delete |
| InboundPackage | 入库包裹 — CRUD + assign customer + status + measurements + hard delete |
| CustomerShipment | 客户集运单 — CRUD + status + payment + items + cancel + hard delete |
| MasterShipment | 国际批次 — CRUD + status + publication + customer shipment links + hard delete |
| TransactionRecord | 交易记录 — CRUD + hard delete (blocked if PAID) |

### 12.2 MasterShipment API (Added)

All endpoints protected by `JwtAuthGuard + AdminGuard`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/master-shipments` | Create batch, auto-generate `batchNo` (GJB + yyyyMMdd + 3-digit-rand) |
| GET | `/api/admin/master-shipments` | List with `q`, `status`, `publicVisible`, pagination |
| GET | `/api/admin/master-shipments/:id` | Detail with linked CustomerShipment list |
| PATCH | `/api/admin/master-shipments/:id` | General update (vendorName, vendorTrackingNo, adminNote, publicTitle, publicSummary, publicStatusText, publicVisible) |
| PATCH | `/api/admin/master-shipments/:id/status` | Update status with auto-timestamps |
| PATCH | `/api/admin/master-shipments/:id/publication` | Set publicVisible, publicTitle, publicSummary, publicStatusText, publishedAt |
| POST | `/api/admin/master-shipments/:id/customer-shipments` | Add CustomerShipments to batch |
| DELETE | `/api/admin/master-shipments/:id/customer-shipments/:csId` | Remove CustomerShipment from batch |
| DELETE | `/api/admin/master-shipments/:id` | Hard delete (requires `?confirm=DELETE_HARD`, blocked unless CREATED status and no linked shipments) |

Auto-timestamps by status:

| Status | Field |
|---|---|
| `HANDED_TO_VENDOR` | `handedToVendorAt` (if not already set) |
| `ARRIVED_OVERSEAS` | `arrivedOverseasAt` (if not already set) |
| `CLOSED` | `closedAt` (if not already set) |

### 12.3 TransactionRecord API (Added)

All endpoints protected by `JwtAuthGuard + AdminGuard`. **No online payment. No payment links. Manual record only.**

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/transactions` | Create transaction |
| GET | `/api/admin/transactions` | List with `customerId`, `customerShipmentId`, `type`, `paymentStatus`, `q`, pagination |
| GET | `/api/admin/transactions/:id` | Detail with customer + shipment info |
| PATCH | `/api/admin/transactions/:id` | Update (type, amountCents, currency, paymentStatus, description, adminNote, occurredAt) |
| DELETE | `/api/admin/transactions/:id` | Hard delete (requires `?confirm=DELETE_HARD`, blocked if paymentStatus=PAID) |

TransactionType values: `SERVICE_FEE`, `SHIPPING_FEE`, `LOCAL_DELIVERY_FEE`, `ADJUSTMENT`, `REFUND`, `OTHER`

Note on REFUND: `amountCents` is always a positive integer. The meaning (credit/debit) is expressed by the `type` field. Frontend should display REFUND differently from SHIPPING_FEE.

### 12.4 Hard Delete Policy

| Resource | Requires confirm | Blocked if | On success |
|---|---|---|---|
| Customer | `?confirm=DELETE_HARD` | inboundPackages > 0 OR customerShipments > 0 OR transactions > 0 | `{ deleted: true, id }` |
| InboundPackage | `?confirm=DELETE_HARD` | shipmentItems > 0 | `{ deleted: true, id }` |
| CustomerShipment | `?confirm=DELETE_HARD` | status is SENT_TO_OVERSEAS+ OR masterShipmentId set OR transactions > 0 | Deletes items, restores packages to CLAIMED, then deletes shipment |
| MasterShipment | `?confirm=DELETE_HARD` | status is not CREATED OR customerShipments > 0 | `{ deleted: true, id }` |
| TransactionRecord | `?confirm=DELETE_HARD` | paymentStatus = PAID | `{ deleted: true, id }` |

Rules:
- No cascading deletes — each resource must be manually cleaned before parent can be deleted.
- No soft archive implemented (no `archivedAt` column in schema).
- Frontend must implement two-step confirmation dialog before calling DELETE.
- Backend validates `confirm=DELETE_HARD` as a second safety gate.

### 12.5 Public API Safety (Confirmed)

`GET /api/public/batch-updates` and `GET /api/public/batch-updates/:batchNo` return only:
- `batchNo`, `statusLabel`, `publicTitle`, `publicSummary`, `publicStatusText`, `publishedAt`, `arrivedOverseasAt`, `updatedAt`

Fields **never** returned by Public API:
- `vendorTrackingNo` — internal carrier tracking
- `adminNote` — internal notes
- `customerShipments` — would leak customer info
- `customerCode`, `phoneNumber`, `displayName` — PII
- `amountCents`, `paymentStatus` — financial data
- `packageImageUrls`, `labelImageUrl` — package images

`GET /api/public/tracking/:shipmentNo` only returns if `publicTrackingEnabled=true` on the shipment. Response excludes all PII, payment info, and admin notes.

### 12.6 No Migration Required

Schema already contained all needed models and fields:
- `MasterShipment` ✅ all required fields present
- `TransactionRecord` ✅ all required fields present
- All `@map` / `@@map` snake_case mappings ✅
- `prisma validate` ✅ / `npm run build` ✅ (0 errors)

### 12.7 Remaining Decisions (User to Confirm)

| Question | Current Behavior |
|---|---|
| Hard delete restricted to OWNER role only? | Current: any valid admin token. RBAC not implemented yet. |
| Already-shipped shipments: permanently non-deletable? | Yes — `SENT_TO_OVERSEAS` and later statuses are blocked. |
| PAID transactions: non-deletable? | Yes — `paymentStatus=PAID` blocks hard delete. |
| MasterShipment post-handover: permanently non-deletable? | Yes — only `CREATED` status allows hard delete. |
