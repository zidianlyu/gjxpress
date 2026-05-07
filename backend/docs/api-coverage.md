# Backend API Coverage Report

> Generated: 2026-05-04
> Global prefix: `/api`
> Auth: JWT Bearer. `JwtAuthGuard` = user or admin. `AdminGuard` = admin-only.

---

## Curl Quick Reference

```bash
# Health
curl http://localhost:3000/api/health

# WeChat mock login → get token
curl -X POST http://localhost:3000/api/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{"code":"dev-test-code","nickname":"Dev User","avatarUrl":""}'

# Set TOKEN from login response
TOKEN="<paste-user-jwt-here>"

# Warehouse address (primary miniprogram endpoint)
curl http://localhost:3000/api/warehouse-address \
  -H "Authorization: Bearer $TOKEN"

# User profile
curl http://localhost:3000/api/user/me \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"

# Orders
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/orders/<orderId> \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/orders/<orderId>/shipment \
  -H "Authorization: Bearer $TOKEN"

# Packages
curl http://localhost:3000/api/packages/<packageId> \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/api/packages/<packageId>/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"CONFIRM"}'

curl -X POST http://localhost:3000/api/packages/<packageId>/issue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"DAMAGED","description":"外包装破损"}'

# Public recommendations (no auth)
curl http://localhost:3000/api/public/recommendations
curl http://localhost:3000/api/public/recommendations/<slug>

# Admin endpoints (require admin JWT)
ADMIN_TOKEN="<paste-admin-jwt-here>"

curl http://localhost:3000/api/admin/orders \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

curl http://localhost:3000/api/admin/exceptions \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Full Coverage Table

| Module | Expected Endpoint | Method | Source Doc | Implemented? | Controller File | Auth | MiniProgram? | Notes |
|---|---|---|---|---|---|---|---|---|
| **Health** | `/health` | GET | api.md §7 | ✅ Yes | `health/health.controller.ts` | Public | No | |
| **Auth** | `/auth/wechat-login` | POST | api.md §8.1 | ✅ Yes | `auth/auth.controller.ts` | Public | Yes | |
| **Auth** | `/auth/admin-login` | POST | api.md §8.2 | ✅ Yes | `auth/auth.controller.ts` | Public | No | |
| **Auth** | `/auth/me` | GET | api.md §8.3 | ✅ Yes | `auth/auth.controller.ts` | JwtAuth | No | Returns raw JWT payload |
| **User** | `/user/profile` | GET | api.md §9.1 | ✅ Yes | `user/user.controller.ts` | JwtAuth (User) | No | |
| **User** | `/user/me` | GET | miniprogram | ✅ Yes | `user/user.controller.ts` | JwtAuth (User) | ✅ Yes | Alias for /user/profile |
| **Warehouse** | `/warehouse-address` | GET | api.md §10.1 | ✅ **Fixed** | `address/address.controller.ts` | JwtAuth (User) | ✅ Yes | Was `/address/warehouse` — path corrected; uses ConfigService + userCode |
| **Orders** | `/orders` | GET | api.md §11.1 | ✅ Yes | `order/order.controller.ts` | JwtAuth (User) | ✅ Yes | |
| **Orders** | `/orders/:id` | GET | api.md §11.2 | ✅ Yes | `order/order.controller.ts` | JwtAuth (User) | ✅ Yes | |
| **Orders** | `/orders/:id/shipment` | GET | miniprogram | ✅ **New** | `order/order.controller.ts` | JwtAuth (User) | ✅ Yes | Added; docs use `/shipments/:orderId` |
| **Admin Orders** | `/admin/orders` | GET | api.md §12.1 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | |
| **Admin Orders** | `/admin/orders/:id` | GET | api.md §12.3 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | Includes openidMasked |
| **Admin Orders** | `/admin/orders` | POST | api.md §12.2 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | Accepts userId or userCode |
| **Admin Orders** | `/admin/orders/:id/status` | PATCH | api.md §12.4 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | |
| **Admin Orders** | `/admin/orders/:id/payment-status` | PATCH | api.md §12.5 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | Creates PaymentRecord + AdminLog |
| **Admin QR** | `/admin/orders/:id/qr` | POST | api.md §18.1 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | Returns raw token once |
| **Packages** | `/packages/:id` | GET | api.md §14.1 | ✅ Yes | `package/package.controller.ts` | JwtAuth (User) | No | |
| **Packages** | `/packages/inbound` | POST | api.md §13.1 | ✅ Yes | `package/package.controller.ts` | AdminGuard | No | Old path; doc expects `/admin/packages/inbound` |
| **Packages** | `/packages/:id/confirm` | POST | api.md §14.2 | ✅ Yes | `package/package.controller.ts` | JwtAuth (User) | ✅ Yes | |
| **Packages** | `/packages/:id/issue` | POST | api.md §14.3 | ✅ **New** | `package/package.controller.ts` | JwtAuth (User) | ✅ Yes | Full exception+order status update |
| **Admin Packages** | `/admin/packages/inbound` | POST | api.md §13.1 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | Canonical admin path |
| **Admin Packages** | `/admin/packages/:id` | PATCH | api.md §13.2 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | Updates weight/dimensions |
| **Images** | `/packages/:id/images` | GET | api.md §15 | ✅ Yes | `image/image.controller.ts` | JwtAuth | No | |
| **Images** | `/packages/:id/images/request-upload-url` | POST | api.md §15.1 | ✅ Yes | `image/image.controller.ts` | AdminGuard | No | |
| **Images** | `/packages/:id/images/confirm-upload` | POST | api.md §15.2 | ✅ Yes | `image/image.controller.ts` | AdminGuard | No | |
| **Images** | `/packages/:id/images/:imageId` | DELETE | api.md §15 | ✅ Yes | `image/image.controller.ts` | AdminGuard | No | |
| **Admin Shipments** | `/admin/shipments` | POST | api.md §17.1 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | |
| **Shipments** | `/shipments/:orderId` | POST | existing | ✅ Yes (old path) | `shipment/shipment.controller.ts` | AdminGuard | No | Old path kept; canonical is `/admin/shipments` |
| **Shipments** | `/shipments/:orderId` | GET | api.md §17.2 | ✅ Yes | `shipment/shipment.controller.ts` | JwtAuth | No | |
| **Exceptions** | `/packages/:id/exceptions` | POST | existing | ✅ Yes | `exception/exception.controller.ts` | JwtAuth (User) | No | |
| **Exceptions** | `/packages/:id/exceptions` | GET | existing | ✅ Yes | `exception/exception.controller.ts` | JwtAuth | No | |
| **Exceptions** | `/packages/:id/exceptions/:id/status` | PATCH | existing | ✅ Yes | `exception/exception.controller.ts` | AdminGuard | No | |
| **Admin Exceptions** | `/admin/exceptions` | GET | api.md §16.1 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | Global list with filters |
| **Admin Exceptions** | `/admin/exceptions/:id` | PATCH | api.md §16.2 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | Handles nextOrderStatus |
| **QR** | `/qr/generate` | POST | existing | ✅ Yes | `qr/qr.controller.ts` | JwtAuth | No | Old path; doc expects `/admin/orders/:id/qr` |
| **QR** | `/qr/scan` | POST | api.md §18.2 | ✅ Yes | `qr/qr.controller.ts` | JwtAuth (User) | No | |
| **Notifications** | `/notifications` | GET | api.md §19 | ✅ Yes | `notification/notification.controller.ts` | JwtAuth (User) | No | |
| **Admin Notifications** | `/admin/notifications` | GET | api.md §19.2 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | |
| **Admin Logs** | `/admin/action-logs` | GET | api.md §20.1 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | |
| **Admin Logs** | `/admin-logs` | GET | existing | ✅ Yes (old path) | `adminlog/adminlog.controller.ts` | AdminGuard | No | Implemented but undocumented path |
| **Admin Users** | `/admin/users` | GET | api.md §9.2 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | |
| **Public** | `/public/recommendations` | GET | api.md §21.1 | ✅ **New** | `public/public.controller.ts` | Public | No | |
| **Public** | `/public/recommendations/:slug` | GET | api.md §21.2 | ✅ **New** | `public/public.controller.ts` | Public | No | |
| **Admin Recs** | `/admin/recommendations` | POST | api.md §21.3 | ✅ **New** | `admin/admin.controller.ts` | AdminGuard | No | |
| **Payment** | `/orders/:id/payment/status` | PATCH | existing | ✅ Yes (old path) | `payment/payment.controller.ts` | AdminGuard | No | Implemented but path differs from docs |

---

## Path Conflicts / Mismatches (docs vs implementation)

| Issue | Doc Path | Actual Path | Recommendation |
|---|---|---|---|
| Inbound package | `/admin/packages/inbound` | `/packages/inbound` (old) | Both now exist; prefer `/admin/packages/inbound` |
| Create shipment | `/admin/shipments` | `/shipments/:orderId` (old) | Both now exist; prefer `/admin/shipments` |
| Payment status | `/admin/orders/:id/payment-status` | `/orders/:id/payment/status` | Both now exist; prefer `/admin/orders/:id/payment-status` |
| Admin logs | `/admin/action-logs` | `/admin-logs` | Both now exist; prefer `/admin/action-logs` |

---

## MiniProgram Path Audit

| MiniProgram Calls | Backend Endpoint | Status |
|---|---|---|
| `GET /warehouse-address` | `GET /api/warehouse-address` | ✅ Fixed |
| `GET /user/me` | `GET /api/user/me` | ✅ Added |
| `GET /orders` | `GET /api/orders` | ✅ OK |
| `GET /orders/:id` | `GET /api/orders/:id` | ✅ OK |
| `GET /orders/:id/shipment` | `GET /api/orders/:id/shipment` | ✅ Added |
| `POST /packages/:id/confirm` | `POST /api/packages/:id/confirm` | ✅ OK |
| `POST /packages/:id/issue` | `POST /api/packages/:id/issue` | ✅ Added |
| `GET /notifications` (assumed) | `GET /api/notifications` | ✅ OK |

---

## New Environment Variables

Added to `.env.example` and `env.validation.ts`:

```bash
WAREHOUSE_RECIPIENT_NAME="广骏仓库"
WAREHOUSE_PHONE=""
WAREHOUSE_COUNTRY="中国"
WAREHOUSE_PROVINCE=""
WAREHOUSE_CITY=""
WAREHOUSE_DISTRICT=""
WAREHOUSE_ADDRESS_LINE=""
WAREHOUSE_POSTAL_CODE=""
WAREHOUSE_COPY_TEMPLATE="收件人：{recipientName}\n电话：{phone}\n地址：{fullAddress}\n邮编：{postalCode}"
```

> **Action required for EC2**: Add these vars to `.env.production` before redeploying.

---

## New Files Created

| File | Purpose |
|---|---|
| `src/address/address.service.ts` | Warehouse address logic with ConfigService |
| `src/admin/admin.controller.ts` | All `/admin/*` endpoints |
| `src/admin/admin.service.ts` | Admin business logic |
| `src/admin/admin.module.ts` | Admin module registration |
| `src/public/public.controller.ts` | Public `/public/recommendations` endpoints |
| `src/public/public.service.ts` | Public recommendations query |
| `src/public/public.module.ts` | Public module registration |
| `docs/api-coverage.md` | This file |

---

## TODO / Future Endpoints

| Endpoint | Status | Notes |
|---|---|---|
| `POST /notifications/subscription` | ⏳ TODO | WeChat subscribe message template IDs |
| `GET /images/:imageId/signed-url` | ⏳ TODO | Read signed URL from Supabase Storage |
| `POST /images/upload-url` (flat path) | ⏳ TODO | Doc uses `/images/upload-url`; current uses `/packages/:id/images/request-upload-url` |
| `POST /images/:imageId/complete` | ⏳ TODO | Doc uses `/images/:imageId/complete`; current uses `/packages/:id/images/confirm-upload` |
| Logistics tracking | ⏳ TODO | Auto-query external carriers |

---

## Admin Core CRUD Coverage (Web Logistics Phase 1)

> Updated: 2026-05-05 | Auth: All `/admin/*` endpoints require `JwtAuthGuard + AdminGuard`. No token → 401. User token → 403.

### Customer

| Capability | Method | Path | Controller | Service | DTO | Admin Guard | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Create customer | POST | `/admin/customers` | `customers.controller.ts` | `create()` | `CreateCustomerDto` | ✅ | ✅ Updated | Phone uniqueness check; auto GJ#### code; accepts domesticReturnAddress |
| List customers | GET | `/admin/customers` | `customers.controller.ts` | `findAll()` | query params | ✅ | ✅ Updated | q, status, page, pageSize; returns `{ items, page, pageSize, total }`; q searches customerCode/phoneNumber/wechatId |
| Get customer detail | GET | `/admin/customers/:id` | `customers.controller.ts` | `findOne()` | — | ✅ | ✅ Implemented | Includes packages, shipments, counts, domesticReturnAddress |
| Update customer | PATCH | `/admin/customers/:id` | `customers.controller.ts` | `update()` | `UpdateCustomerDto` | ✅ | ✅ Updated | phone, wechatId, **domesticReturnAddress**, notes, status (`ACTIVE`/`DISABLED`); customerCode immutable |
| Soft-disable customer | PATCH | `/admin/customers/:id/disable` | `customers.controller.ts` | `disable()` | — | ✅ | ✅ Implemented | Sets status=DISABLED |
| Hard delete | DELETE | `/admin/customers/:id` | `customers.controller.ts` | `hardDelete()` | `?confirm=DELETE_HARD` | ✅ | ✅ Implemented | 409 if inboundPackages/customerShipments/transactions > 0 |

### InboundPackage

| Capability | Method | Path | Controller | Service | DTO | Admin Guard | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Create inbound package | POST | `/admin/inbound-packages` | `inbound-packages.controller.ts` | `create()` | `CreateInboundPackageDto` | ✅ | ✅ Updated | domesticTrackingNo optional; customerCode resolves customerId; no code → UNIDENTIFIED; code → ARRIVED |
| List packages | GET | `/admin/inbound-packages` | `inbound-packages.controller.ts` | `findAll()` | query params | ✅ | ✅ Updated | returns `{ items, page, pageSize, total }`; q searches domesticTrackingNo/customerCode/phoneNumber/wechatId; includes customer and imageUrls |
| Get package detail | GET | `/admin/inbound-packages/:id` | `inbound-packages.controller.ts` | `findOne()` | — | ✅ | ✅ Implemented | Includes customer, shipmentItems |
| General update | PATCH | `/admin/inbound-packages/:id` | `inbound-packages.controller.ts` | `update()` | inline DTO | ✅ | ✅ Updated | domesticTrackingNo, warehouseReceivedAt, issueNote, adminNote, status (no dimensions) |
| Assign customer | PATCH | `/admin/inbound-packages/:id/assign-customer` | `inbound-packages.controller.ts` | `assignCustomer()` | inline DTO | ✅ | ✅ Implemented | 409 if already assigned; 404 if code not found |
| Update status | PATCH | `/admin/inbound-packages/:id/status` | `inbound-packages.controller.ts` | `updateStatus()` | inline DTO | ✅ | ✅ Updated | Valid values: UNIDENTIFIED, ARRIVED, CONSOLIDATED |
| List images | GET | `/admin/inbound-packages/:id/images` | `inbound-packages.controller.ts` | `getImages()` | — | ✅ | ✅ **New** | Returns `{ items: string[] }` |
| Upload image | POST | `/admin/inbound-packages/:id/images` | `inbound-packages.controller.ts` | `uploadImage()` | multipart/form-data `file` | ✅ | ✅ **New** | Uploads to Supabase Storage; appends URL to imageUrls; returns `{ url, imageUrls }` |
| Delete image | DELETE | `/admin/inbound-packages/:id/images` | `inbound-packages.controller.ts` | `deleteImage()` | `?imageUrl=<encoded>&confirm=DELETE_HARD` | ✅ | ✅ **Updated** | Query params only; removes from storage and imageUrls; returns `{ deleted, url, imageUrls }` |
| Hard delete | DELETE | `/admin/inbound-packages/:id` | `inbound-packages.controller.ts` | `hardDelete()` | `?confirm=DELETE_HARD` | ✅ | ✅ Implemented | 409 if shipmentItems > 0 |

### CustomerShipment

| Capability | Method | Path | Controller | Service | DTO | Admin Guard | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Create shipment | POST | `/admin/customer-shipments` | `customer-shipments.controller.ts` | `create()` | inline DTO | ✅ | ✅ Updated | Auto GJS{date}{seq} shipmentNo; accepts quantity and billing fields on create |
| List shipments | GET | `/admin/customer-shipments` | `customer-shipments.controller.ts` | `findAll()` | query params | ✅ | ✅ Updated | q, status, paymentStatus, customerId, masterShipmentId, **unbatched=true**; returns quantity and statusText |
| Get shipment detail | GET | `/admin/customer-shipments/:id` | `customer-shipments.controller.ts` | `findOne()` | — | ✅ | ✅ Implemented | Includes customer, items, masterShipment, transactions |
| General update | PATCH | `/admin/customer-shipments/:id` | `customer-shipments.controller.ts` | `update()` | inline DTO | ✅ | ✅ Updated | notes, trackingNo, publicTracking, status, paymentStatus, quantity, actualWeightKg, volumeFormula, billingRateCnyPerKg, billingWeightKg |
| Cancel shipment | PATCH | `/admin/customer-shipments/:id/cancel` | `customer-shipments.controller.ts` | `cancel()` | — | ✅ | ✅ Updated | Blocked if SHIPPED+; restores packages to ARRIVED |
| Update status | PATCH | `/admin/customer-shipments/:id/status` | `customer-shipments.controller.ts` | `updateStatus()` | inline DTO | ✅ | ✅ Updated | Valid values: PACKED, SHIPPED, ARRIVED, READY_FOR_PICKUP, PICKED_UP, EXCEPTION |
| Update payment status | PATCH | `/admin/customer-shipments/:id/payment-status` | `customer-shipments.controller.ts` | `updatePaymentStatus()` | inline DTO | ✅ | ✅ Implemented | Enum validation; no online payment |
| Add item | POST | `/admin/customer-shipments/:id/items` | `customer-shipments.controller.ts` | `addItem()` | inline DTO | ✅ | ✅ Implemented | Customer match check; 409 if in another shipment |
| Remove item | DELETE | `/admin/customer-shipments/:id/items/:itemId` | `customer-shipments.controller.ts` | `removeItem()` | — | ✅ | ✅ Updated | 409 if SHIPPED+; restores package to ARRIVED |
| List images | GET | `/admin/customer-shipments/:id/images` | `customer-shipments.controller.ts` | `getImages()` | — | ✅ | ✅ **New** | Returns `{ items: string[] }` |
| Upload image | POST | `/admin/customer-shipments/:id/images` | `customer-shipments.controller.ts` | `uploadImage()` | multipart/form-data `file` | ✅ | ✅ **New** | Uploads to Supabase Storage; appends URL to imageUrls; returns `{ url, imageUrls }` |
| Delete image | DELETE | `/admin/customer-shipments/:id/images` | `customer-shipments.controller.ts` | `deleteImage()` | `?imageUrl=<encoded>&confirm=DELETE_HARD` | ✅ | ✅ **Updated** | Query params only; removes from storage and imageUrls; returns `{ deleted, url, imageUrls }` |
| Hard delete shipment | DELETE | `/admin/customer-shipments/:id` | `customer-shipments.controller.ts` | `hardDelete()` | `?confirm=DELETE_HARD` | ✅ | ✅ Implemented | 409 if in-transit/completed, masterShipmentId set, or transactions > 0; cascades item cleanup |

### CustomerShipmentItem

| Capability | Method | Path | Controller | Service | Admin Guard | Status | Notes |
|---|---|---|---|---|---|---|---|
| Add item to shipment | POST | `/admin/customer-shipments/:id/items` | `customer-shipments.controller.ts` | `addItem()` | ✅ | ✅ Implemented | — |
| Remove item from shipment | DELETE | `/admin/customer-shipments/:id/items/:itemId` | `customer-shipments.controller.ts` | `removeItem()` | ✅ | ✅ Implemented | — |

### MasterShipment

| Capability | Method | Path | Controller | Service | DTO | Admin Guard | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Create batch | POST | `/admin/master-shipments` | `master-shipments.controller.ts` | `create()` | inline DTO | ✅ | ✅ Updated | Auto GJByyyyMMddNNN batchNo; **vendorName + vendorTrackingNo + customerShipmentIds all required**; atomic transaction; validates no duplicates/already-batched |
| List batches | GET | `/admin/master-shipments` | `master-shipments.controller.ts` | `findAll()` | query params | ✅ | ✅ Implemented | q, status, publicVisible, page, pageSize |
| Get batch detail | GET | `/admin/master-shipments/:id` | `master-shipments.controller.ts` | `findOne()` | — | ✅ | ✅ Implemented | Includes customerShipments summary |
| General update | PATCH | `/admin/master-shipments/:id` | `master-shipments.controller.ts` | `update()` | inline DTO | ✅ | ✅ **Added** | vendorName, vendorTrackingNo, adminNote, publicTitle, publicSummary, publicStatusText, publicVisible |
| Update status | PATCH | `/admin/master-shipments/:id/status` | `master-shipments.controller.ts` | `updateStatus()` | inline DTO | ✅ | ✅ Implemented | Auto-fills handedToVendorAt, arrivedOverseasAt, closedAt |
| Update publication | PATCH | `/admin/master-shipments/:id/publication` | `master-shipments.controller.ts` | `updatePublication()` | inline DTO | ✅ | ✅ Implemented | Sets publicVisible, titles, publishedAt |
| Add customer shipments | POST | `/admin/master-shipments/:id/customer-shipments` | `master-shipments.controller.ts` | `addCustomerShipments()` | inline DTO | ✅ | ✅ Implemented | Batch link with conflict checks |
| Remove customer shipment | DELETE | `/admin/master-shipments/:id/customer-shipments/:csId` | `master-shipments.controller.ts` | `removeCustomerShipment()` | — | ✅ | ✅ Implemented | 409 if batch status is advanced |
| Hard delete batch | DELETE | `/admin/master-shipments/:id` | `master-shipments.controller.ts` | `hardDelete()` | `?confirm=DELETE_HARD` | ✅ | ✅ **Added** | 409 if status != CREATED or customerShipments > 0 |

### TransactionRecord

| Capability | Method | Path | Controller | Service | DTO | Admin Guard | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Create transaction | POST | `/admin/transactions` | `transactions.controller.ts` | `create()` | inline DTO | ✅ | ✅ Updated | **customerShipmentId required**; type: SHIPPING_FEE\|REFUND only; no currency/paymentStatus/description |
| List transactions | GET | `/admin/transactions` | `transactions.controller.ts` | `findAll()` | query params | ✅ | ✅ Updated | q, customerId, customerShipmentId, type (no paymentStatus filter) |
| Get transaction detail | GET | `/admin/transactions/:id` | `transactions.controller.ts` | `findOne()` | — | ✅ | ✅ Implemented | Includes customer and shipment summary |
| Update transaction | PATCH | `/admin/transactions/:id` | `transactions.controller.ts` | `update()` | inline DTO | ✅ | ✅ Updated | type, amountCents, adminNote, occurredAt only |
| Hard delete transaction | DELETE | `/admin/transactions/:id` | `transactions.controller.ts` | `hardDelete()` | `?confirm=DELETE_HARD` | ✅ | ✅ Implemented | No longer blocked on paymentStatus (field removed) |

### CustomerRegistration

| Capability | Method | Path | Controller | Service | DTO | Admin Guard | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| Admin create registration | POST | `/admin/customer-registrations` | `customer-registrations.controller.ts` | `adminCreate()` | `CreateCustomerRegistrationDto` | ✅ | ✅ **New** | Enters PENDING queue; 409 if PENDING/APPROVED exists for same phone |
| List registrations | GET | `/admin/customer-registrations` | `customer-registrations.controller.ts` | `findAll()` | query params | ✅ | ✅ **New** | q, status (PENDING/APPROVED/REJECTED), page, pageSize |
| Get registration detail | GET | `/admin/customer-registrations/:id` | `customer-registrations.controller.ts` | `findOne()` | — | ✅ | ✅ **New** | Includes createdCustomer summary |
| Update registration | PATCH | `/admin/customer-registrations/:id` | `customer-registrations.controller.ts` | `update()` | `UpdateCustomerRegistrationDto` | ✅ | ✅ **New** | phone, wechatId, domesticReturnAddress, notes, reviewNote (no status change) |
| Approve registration | POST | `/admin/customer-registrations/:id/approve` | `customer-registrations.controller.ts` | `approve()` | `{ reviewNote? }` | ✅ | ✅ **New** | Atomic tx: creates Customer + updates status; 409 if already approved or phone conflict |
| Reject registration | POST | `/admin/customer-registrations/:id/reject` | `customer-registrations.controller.ts` | `reject()` | `{ reviewNote? }` | ✅ | ✅ **New** | 409 if already APPROVED |
| Hard delete registration | DELETE | `/admin/customer-registrations/:id` | `customer-registrations.controller.ts` | `hardDelete()` | `?confirm=DELETE_HARD` | ✅ | ✅ **New** | Does NOT delete created Customer; 400 if confirm missing |

### Public Endpoints

| Capability | Method | Path | Controller | Service | Auth | Status | Notes |
|---|---|---|---|---|---|---|---|
| Submit customer registration | POST | `/public/customer-registrations` | `public.controller.ts` | `submitRegistration()` | None | ✅ **New** | No auth; returns customerCode+PENDING; 409 if PENDING/APPROVED exists for phone |
| Track shipment | GET | `/public/tracking/:shipmentNo` | `public.controller.ts` | `trackShipment()` | None | ✅ Implemented | Returns NO_RECORD if not found/disabled; no PII |
| List batch updates | GET | `/public/batch-updates` | `public.controller.ts` | `listBatchUpdates()` | None | ✅ Implemented | Only publicVisible=true batches; no vendorTrackingNo |
| Get batch update | GET | `/public/batch-updates/:batchNo` | `public.controller.ts` | `getBatchUpdate()` | None | ✅ Implemented | 404 if not found or not publicVisible |

---

## Logging / Tracing

| Feature | Implementation | Notes |
|---|---|---|
| Request ID | `src/common/middleware/request-id.middleware.ts` | Uses incoming `X-Request-Id` or generates UUID |
| Request logging | `src/common/interceptors/request-logging.interceptor.ts` | Logs method, path, status, durationMs, userType, userId, role |
| Error logging | `src/common/filters/http-exception.filter.ts` | 4xx → WARN, 5xx → ERROR with stack (backend only); requestId in response |
| CORS | `main.ts` | `exposedHeaders: ['x-request-id']` — frontend can read it |
| Env flags | `API_REQUEST_LOGGING`, `API_DEBUG_BODY_LOGS` | See `docs/deployment.md` |

---

## Build & Test Status

| Check | Result |
|---|---|
| `npx prisma validate` | ✅ |
| `npx prisma generate` | ✅ |
| `npm run build` | ✅ 0 errors (2026-05-06, session 5 — Phase 3: customer registration review, domesticReturnAddress) |
| `GET /api/health` | ✅ 200 |
| `POST /api/auth/wechat-login` (mock) | ✅ 200 + JWT |
| `GET /api/warehouse-address` | ✅ 200 + userCode in receiverName |
| `GET /api/user/me` | ✅ 200 |
| `GET /api/user/profile` | ✅ 200 |
| `GET /api/orders` | ✅ 200 |
| `GET /api/orders/:id/shipment` (bad id) | ✅ 404 |
| `GET /api/public/recommendations` | ✅ 200 |
| `GET /api/admin/orders` (user token) | ✅ 403 |
| `GET /api/admin/customers` (no token) | ✅ 401 |
| `POST /api/admin/customers` (admin token) | ✅ 201 |
| `GET /api/admin/inbound-packages` (admin token) | ✅ 200 |
| `GET /api/admin/customer-shipments` (admin token) | ✅ 200 |
| Response header `x-request-id` present | ✅ |
