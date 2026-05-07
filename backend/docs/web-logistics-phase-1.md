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
| wechatId | VARCHAR(64) | optional |
| domesticReturnAddress | TEXT | optional |

`customerCode` is the business identifier shown to admins and customers. Database relations still use UUID primary keys such as `customers.id` and `inbound_packages.customer_id`; Admin package APIs resolve `customerCode` to the UUID FK in backend service code.
Formal Customer and CustomerRegistration no longer have `status` fields. A CustomerRegistration row exists only while it is waiting for review; approval creates Customer and hard deletes the registration.

### 1.3 InboundPackage
Packages received at the China warehouse.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| domesticTrackingNo | VARCHAR(64) | unique, optional |
| customerId | UUID? | FK to Customer, nullable if unidentified |
| status | InboundPackageStatus | see enum |
| warehouseReceivedAt | TIMESTAMP | |
| imageUrls | TEXT[] | array of URLs |
| note | TEXT | Internal package note; replaces legacy issueNote/adminNote |

### 1.4 CustomerShipment
One shipment per customer (multiple inbound packages consolidated).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| shipmentNo | VARCHAR(32) | unique, format GJS20260504123 |
| customerId | UUID | FK to Customer |
| masterShipmentId | UUID? | FK to MasterShipment |
| status | CustomerShipmentStatus | see enum |
| paymentStatus | PaymentStatus | CustomerShipment values: UNPAID/PAID/REFUNDED |
| quantity | INT | piece count, default 1 |
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
| vendorName/vendorTrackingNo | VARCHAR | vendorName allowed values: DHL/UPS/FEDEX/EMS/OTHER; frontend label is “供应商” |
| status | MasterShipmentStatus | see enum |
| publicPublished | BOOLEAN | API field backed by `public_visible`, default true; controls public feed |
| note | TEXT | API field backed by `admin_note` |
| publishedAt | TIMESTAMP | set when publicPublished first set to true |

### 1.7 TransactionRecord
Financial records for customers.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| customerId | UUID | FK to Customer |
| customerShipmentId | UUID? | FK to CustomerShipment |
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
| InboundPackageStatus | UNIDENTIFIED, ARRIVED, CONSOLIDATED |
| CustomerShipmentStatus | PACKED, SHIPPED, ARRIVED, READY_FOR_PICKUP, PICKED_UP, EXCEPTION |
| MasterShipmentStatus | IN_TRANSIT, SIGNED, READY_FOR_PICKUP, EXCEPTION |

CustomerShipment paymentStatus values: `UNPAID`（未支付）, `PAID`（已支付）, `REFUNDED`（已退款）. Legacy shared PaymentStatus enum values may still exist for older order/payment modules, but CustomerShipment API rejects them.

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
| PATCH | /api/admin/customers/:id | Update phone, wechatId, domesticReturnAddress, status |

### 5.2 InboundPackages `/api/admin/inbound-packages`
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/admin/inbound-packages | Create (auto-binds by customerCode if provided) |
| GET | /api/admin/inbound-packages | List with search (q, status, customerId, customerCode) |
| GET | /api/admin/inbound-packages/:id | Detail with customer + shipment info |
| PATCH | /api/admin/inbound-packages/:id/assign-customer | Assign customer by customerCode |
| PATCH | /api/admin/inbound-packages/:id/status | Update status |

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
| POST | /api/admin/master-shipments | Create batch from unbatched, PAID, same-type CustomerShipments |
| GET | /api/admin/master-shipments | List with filter (q, status, publicPublished) |
| GET | /api/admin/master-shipments/:id | Detail with all customer shipments |
| PATCH | /api/admin/master-shipments/:id/status | Update status (auto-sets timestamps) |
| POST | /api/admin/master-shipments/:id/customer-shipments | Rejected after create; linked shipments are read-only |
| DELETE | /api/admin/master-shipments/:id/customer-shipments/:csId | Rejected after create; linked shipments are read-only |
| PATCH | /api/admin/master-shipments/:id/publication | Set publicPublished |

### 5.5 Transactions `/api/admin/transactions`
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/admin/transactions | Create transaction record from customerShipmentId and amountCents |
| GET | /api/admin/transactions | List with customerId/customerShipmentId/q filters; includes customerShipment.shipmentType |
| GET | /api/admin/transactions/:id | Detail with shipmentNo, shipmentType, and customerCode |
| PATCH | /api/admin/transactions/:id | Update adminNote only |

---

## 6. New Public APIs (No Auth)

### GET /api/tracking?q=GJS20260507267
- Returns tracking info by `shipmentNo` first for `GJS...`, then `customerCode`, `domesticTrackingNo`, `internationalTrackingNo`, or master shipment `vendorTrackingNo`
- Returns `{ found: false, message: 'NO_RECORD' }` if not found or `publicTrackingEnabled = false`
- **No PII exposed:** no customer id, phone, WeChat, address, images, transactions, notes, or internal UUIDs
- Returns: shipmentNo, status, Chinese status label, timeline timestamps, and low-sensitive batch info

**Privacy guarantees:**
- `customerId`, `customer.phoneNumber`, `customer.wechatId`, `domesticReturnAddress`, `imageUrls`, `transactions`, and notes are never included
- Only returns data if `publicTrackingEnabled = true`

### GET /api/tracking/batch-updates
- Returns recent master shipments ordered by `createdAt desc`; default `limit=10`, max `50`
- Returns: vendorName, vendorTrackingNo, shipmentType, status, customerShipmentCount, createdAt, updatedAt
- **No PII:** no customer data, linked shipment details, images, transactions, internal ids, or admin notes

---

## 7. Chinese Status Labels

Source: `src/common/status-labels.ts`

| Status | Chinese Label |
|--------|--------------|
| UNIDENTIFIED | 未识别 |
| ARRIVED | 已入库 |
| CONSOLIDATED | 已合箱 |
| PACKED | 已打包 |
| SHIPPED | 已发货 |
| ARRIVED | 已到达 |
| READY_FOR_PICKUP | 待自提 |
| PICKED_UP | 已取货 |
| EXCEPTION | 异常 |
| IN_TRANSIT | 运输中 |
| SIGNED | 已签收 |
| READY_FOR_PICKUP | 待客人领取 |

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
- [ ] `GET /api/tracking?q=GJS20260507267` returns public low-sensitive tracking data or NO_RECORD (no token needed)
- [ ] `GET /api/tracking/batch-updates?limit=10` returns recent low-sensitive batch updates (no token needed)
- [ ] `npm run build` passes with 0 errors ✅
- [ ] Migration SQL has no DROP TABLE / TRUNCATE ✅
- [ ] Old mini program APIs (`/api/orders`, `/api/packages`) still accessible

---

## 12. Phase 1 Completion Audit — Admin Core CRUD (Session 2)

### 12.1 Scope Expanded

Phase 1 Admin API now fully covers 5 resources:

| Resource | Description |
|---|---|
| Customer | 客户档案 — CRUD + hard delete safeguards; no status/disable workflow |
| InboundPackage | 入库包裹 — CRUD + assign customer by customerCode + simplified status + images + hard delete |
| CustomerShipment | 客户集运单 — CRUD + quantity + simplified status + payment + items + hard delete |
| MasterShipment | 国际批次 — CRUD + status + publication + customer shipment links + hard delete |
| TransactionRecord | 交易记录 — CRUD + hard delete (blocked if PAID) |

### 12.2 MasterShipment API (Added)

All endpoints protected by `JwtAuthGuard + AdminGuard`.

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/master-shipments` | Create batch, auto-generate `batchNo` (GJB + yyyyMMdd + 3-digit-rand); `shipmentType` AIR_GENERAL/AIR_SENSITIVE/SEA |
| GET | `/api/admin/master-shipments` | List with `q`, `status`, `publicPublished`, pagination; includes `shipmentType` |
| GET | `/api/admin/master-shipments/:id` | Detail with `shipmentType` and linked CustomerShipment list |
| PATCH | `/api/admin/master-shipments/:id` | Update note, publicPublished, or status only |
| PATCH | `/api/admin/master-shipments/:id/status` | Update status with auto-timestamps |
| PATCH | `/api/admin/master-shipments/:id/publication` | Set publicPublished |
| POST | `/api/admin/master-shipments/:id/customer-shipments` | Rejected: linked shipments are read-only after create |
| DELETE | `/api/admin/master-shipments/:id/customer-shipments/:csId` | Rejected: linked shipments are read-only after create |
| DELETE | `/api/admin/master-shipments/:id` | Hard delete (requires `?confirm=DELETE_HARD`; detaches linked CustomerShipments) |

Auto-timestamps by status:

| Status | Field |
|---|---|
| `SIGNED` | `arrivedOverseasAt` (if not already set) |

Creating a MasterShipment requires selected CustomerShipments to be unbatched, `PAID`, and the same `shipmentType`; creation updates selected CustomerShipment `status=SHIPPED` in the same transaction. Public batch updates only show `publicPublished=true` rows and no longer use publicTitle/publicSummary/publicStatusText.

### 12.3 TransactionRecord API (Added)

All endpoints protected by `JwtAuthGuard + AdminGuard`. **No online payment. No payment links. Manual record only.**

Frontend submits `customerShipmentId`, `amountCents`, and optional `adminNote`; backend loads the CustomerShipment and writes the internal UUID `customerId` onto TransactionRecord. Creating a transaction marks `CustomerShipment.paymentStatus=PAID` in the same Prisma transaction. Hard deleting a TransactionRecord resets the related shipment paymentStatus to `UNPAID`. `GET /api/admin/transactions` returns `customerShipment.shipmentType` for transport-type display.

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/transactions` | Create transaction with `customerShipmentId`, `amountCents`, optional `adminNote`; backend derives customerId and marks shipment paid |
| GET | `/api/admin/transactions` | List with `customerId`, `customerShipmentId`, `q`, pagination; display transport type from customerShipment.shipmentType |
| GET | `/api/admin/transactions/:id` | Detail with customerShipment.shipmentNo, customerShipment.shipmentType, and customer.customerCode |
| PATCH | `/api/admin/transactions/:id` | Update adminNote only; amountCents/customerShipmentId/customerId are immutable |
| DELETE | `/api/admin/transactions/:id` | Hard delete (requires `?confirm=DELETE_HARD`) |

CustomerShipment and MasterShipment `shipmentType` values are identical: `AIR_GENERAL`（空运普货）, `AIR_SENSITIVE`（空运敏货）, `SEA`（海运）. MasterShipment creation only accepts CustomerShipments with the same shipmentType. MasterShipment `vendorName` remains the API field and database column `vendor_name`; allowed values are `DHL`, `UPS`, `FEDEX`, `EMS`, `OTHER`.

TransactionRecord no longer has `type`; transport type shown on payment-order screens comes from `customerShipment.shipmentType`.

### 12.4 Hard Delete Policy

| Resource | Requires confirm | Blocked if | On success |
|---|---|---|---|
| Customer | `?confirm=DELETE_HARD` | inboundPackages > 0 OR customerShipments > 0 OR transactions > 0 | `{ deleted: true, id }` |
| InboundPackage | `?confirm=DELETE_HARD` | shipmentItems > 0 | `{ deleted: true, id }` |
| CustomerShipment | `?confirm=DELETE_HARD` | paymentStatus=PAID OR transactions > 0; existing in-transit/batched blockers also apply | Delete corresponding TransactionRecord first, then deletes items, restores packages to ARRIVED, and deletes shipment |
| MasterShipment | `?confirm=DELETE_HARD` | none for linked CustomerShipments | Detaches CustomerShipments and returns `{ deleted: true, id, detachedCustomerShipmentCount }` |
| TransactionRecord | `?confirm=DELETE_HARD` | paymentStatus = PAID | `{ deleted: true, id }` |

Rules:
- No cascading deletes — each resource must be manually cleaned before parent can be deleted.
- No soft archive implemented (no `archivedAt` column in schema).
- Frontend must implement two-step confirmation dialog before calling DELETE.
- Backend validates `confirm=DELETE_HARD` as a second safety gate.

### 12.5 Public API Safety (Confirmed)

`GET /api/tracking/batch-updates` returns only:
- `vendorName`, `vendorTrackingNo`, `shipmentType`, `status`, `statusLabel`, `customerShipmentCount`, `createdAt`, `updatedAt`

Fields **never** returned by Public API:
- `adminNote` — internal notes
- `customerShipments` — would leak customer info
- `customerCode`, `phoneNumber`, `wechatId` — PII
- `amountCents`, `paymentStatus` — financial data
- `imageUrls` — package images

`GET /api/tracking?q=...` only returns if `publicTrackingEnabled=true` on the shipment. Response excludes all PII, payment info, and admin notes. `vendorTrackingNo` is returned for the batch update area because the current public UI needs a recognizable batch identifier.

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
| Already-shipped shipments: permanently non-deletable? | Yes — `SHIPPED` and later active statuses are blocked. |
| PAID transactions: non-deletable? | Yes — `paymentStatus=PAID` blocks hard delete. |
| MasterShipment delete status blocker? | No — hard delete detaches linked CustomerShipments and deletes the batch; it does not roll back CustomerShipment.status. |
