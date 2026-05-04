# Backend PRD — GJXpress Logistic OS

> Project: 广骏供应链服务 / GJXpress  
> Scope: `backend/` only  
> Runtime: NestJS + Prisma + Supabase Postgres + Supabase Storage  
> Deployment: AWS EC2 + Docker Compose + Nginx  
> API Domain: `https://api.gjxpress.net`

---

## 1. Backend Mission

The backend is the single source of truth for the Logistic OS.

It must provide secure APIs for:

1. WeChat Mini Program users.
2. Admin dashboard users.
3. Public SEO frontend pages.
4. Future automation jobs such as logistics polling, notification sending, and recommendation updates.

The backend must hide all sensitive credentials from clients. The Mini Program, frontend, and admin dashboard should never directly use:

- `WECHAT_APP_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- Prisma database URLs
- any payment or logistics provider secrets

All clients call `https://api.gjxpress.net`.

---

## 2. Backend Responsibilities

### 2.1 User Identity

- Support WeChat Mini Program login.
- Exchange `wx.login()` code for `openid`.
- Create or update a user record.
- Generate a 4-digit `user_code`.
- Return backend-issued JWT.
- Enforce that users can only view their own orders and packages.

### 2.2 Admin Operations

- Support admin login.
- Support role-based access for at least:
  - `ADMIN`
  - `SUPER_ADMIN`
- Allow admins to create and manage orders, packages, inbound records, payment statuses, shipments, exceptions, and QR codes.
- Log all sensitive admin operations.

### 2.3 Package Inbound Workflow

- Admin records package arrival at domestic warehouse.
- Admin uploads or registers package images:
  - outer package image
  - shipping label image
  - inner goods image
  - exception image
- Admin records weight and dimensions.
- Backend calculates volume weight and chargeable weight.
- Backend moves package/order to user confirmation flow.

### 2.4 User Confirmation Workflow

- User views package images and details.
- User confirms package is correct.
- Or user reports an issue.
- Backend validates package ownership.
- Backend updates package status and order status.

### 2.5 Payment State Control

The backend does **not** integrate WeChat Pay or Alipay in V1.

Payment is tracked as an operational state only:

- `UNPAID`
- `PROCESSING`
- `PAID`

Admins may manually mark orders as paid.

Important business rule:

```text
If order.payment_status != PAID, the order cannot be shipped by default.
```

Admin override is allowed, but must:

1. Require a reason.
2. Mark `manual_override = true`.
3. Create `AdminActionLog`.

### 2.6 Shipment and Logistics

- Admin creates shipment records.
- Admin enters carrier:
  - UPS
  - DHL
  - EMS
  - OTHER
- Admin enters tracking number.
- Admin enters shipped time and ETA.
- Future API polling must be supported through `raw_payload` JSON fields.

### 2.7 QR Confirmation

- Backend generates QR token for order-level confirmation.
- Token is bound to `order_id` and original `user_id`.
- Only the original WeChat user may scan and trigger a state update.
- Other users scanning the QR should produce no business state change.
- Every scan attempt is logged.

### 2.8 Storage

- Use Supabase Storage for package images and proof images.
- Backend controls upload permission.
- Store file metadata in Postgres.
- Clients should not receive Supabase service keys.
- Prefer signed upload URLs or backend-mediated upload.

### 2.9 Public Recommendation System

The backend also supports lightweight public recommendation data for the Next.js frontend:

- public listing pages
- recommendation detail pages
- categories/tags/cities
- SEO-friendly content

This module should be separate from logistics modules and should not expose private user/order data.

---

## 3. Non-Goals for Backend V1

Do not implement in V1:

- In-app payment processing.
- ID card verification.
- Customs declaration automation.
- Full third-party logistics API integration.
- Full warehouse inventory system.
- Multi-tenant billing.
- Complex CRM.
- AI recommendation ranking.
- Direct Supabase client access from Mini Program.

---

## 4. User Roles

## 4.1 Mini Program User

A Mini Program user can:

- login through WeChat
- view own profile
- view own orders
- view own packages
- view inbound photos
- confirm package
- report package issue
- view shipment status
- view warehouse address
- trigger QR scan confirmation for own order

A Mini Program user cannot:

- view other users' orders
- modify payment status
- create shipments
- override order state
- access admin logs
- access private recommendation drafts

## 4.2 Admin

An admin can:

- search users
- create orders
- create inbound package records
- upload/register package images
- update order/package status
- update payment status
- create shipments
- handle exceptions
- generate QR code tokens
- view admin logs

## 4.3 Super Admin

A super admin can additionally:

- create/deactivate admin users
- configure pricing rules
- manage warehouse address settings
- access sensitive system settings
- perform destructive actions if enabled

---

## 5. Core Domain Concepts

## 5.1 User

A WeChat user uniquely identified by `openid`.

Display identity:

- `nickname`
- `avatar_url`
- 4-digit `user_code`

`user_code` is not a security credential. It is only for operational matching and warehouse labels.

## 5.2 Order

An international shipping order.

An order may contain multiple packages.

Order-level fields include:

- order number
- owner user
- order status
- payment status
- total actual weight
- total volume weight
- chargeable weight
- estimated price
- final price
- shipment info

## 5.3 Package

A domestic inbound package.

A package may originate from:

- Taobao
- JD
- Pinduoduo
- other ecommerce platform

Package-level fields include:

- package number
- domestic tracking number
- source platform
- inbound time
- weight
- dimensions
- photos
- confirmation status

## 5.4 Inbound Record

A warehouse check record created when a package arrives.

It captures:

- operator admin
- timestamp
- weight/dimensions
- photos
- check result
- remarks

## 5.5 Exception Case

A problem reported by user or admin.

Types:

- missing item
- wrong item
- damaged package
- restricted item
- other

## 5.6 Shipment

International shipping record.

Fields:

- provider
- tracking number
- status
- shipped time
- estimated arrival
- raw logistics payload for future API integration

## 5.7 Recommendation

Public content used by SEO frontend.

Examples:

- local Chinese community recommendations
- logistics guide pages
- cross-border shopping guides
- service explanations

---

## 6. Status Enums

## 6.1 Order Status

```text
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
```

### Status Meaning

| Status | Meaning |
|---|---|
| `UNINBOUND` | Order exists but no package has arrived. |
| `INBOUNDED` | At least one package has arrived at domestic warehouse. |
| `USER_CONFIRM_PENDING` | Waiting for user to confirm inbound package details. |
| `REVIEW_PENDING` | User confirmed; admin review pending. |
| `PAYMENT_PENDING` | Admin reviewed; waiting for payment completion. |
| `PAID` | Payment marked as paid. |
| `READY_TO_SHIP` | Ready for international shipment. |
| `SHIPPED` | International shipment created. |
| `COMPLETED` | User confirmed receipt or order finished. |
| `EXCEPTION` | Order is blocked by issue. |
| `CANCELLED` | Order cancelled. |

## 6.2 Package Status

```text
CREATED
INBOUNDED
USER_CONFIRM_PENDING
CONFIRMED
EXCEPTION
CONSOLIDATED
SHIPPED
COMPLETED
CANCELLED
```

## 6.3 Payment Status

```text
UNPAID
PROCESSING
PAID
REFUNDED
WAIVED
```

`WAIVED` is reserved for manual operational exceptions.

## 6.4 Exception Status

```text
OPEN
PROCESSING
RESOLVED
CANCELLED
```

## 6.5 Shipment Status

```text
CREATED
READY
SHIPPED
IN_TRANSIT
DELIVERED
EXCEPTION
CANCELLED
```

---

## 7. State Transition Rules

## 7.1 Normal Flow

```text
UNINBOUND
→ INBOUNDED
→ USER_CONFIRM_PENDING
→ REVIEW_PENDING
→ PAYMENT_PENDING
→ PAID
→ READY_TO_SHIP
→ SHIPPED
→ COMPLETED
```

## 7.2 Inbound Flow

When admin creates inbound package:

1. Package status becomes `INBOUNDED`.
2. Package may immediately become `USER_CONFIRM_PENDING`.
3. Order status becomes `INBOUNDED` or `USER_CONFIRM_PENDING`.

## 7.3 User Confirmation

When user confirms all pending packages:

```text
Package: USER_CONFIRM_PENDING → CONFIRMED
Order: USER_CONFIRM_PENDING → REVIEW_PENDING
```

If user reports issue:

```text
Package: USER_CONFIRM_PENDING → EXCEPTION
Order: → EXCEPTION
ExceptionCase: OPEN
```

## 7.4 Payment

When admin marks paid:

```text
Order.payment_status = PAID
Order.status = PAID
```

Then admin may move:

```text
PAID → READY_TO_SHIP
```

## 7.5 Shipping

Default rule:

```text
Order can be shipped only when payment_status = PAID.
```

Admin override:

```text
If payment_status != PAID, admin may force shipment with reason.
```

This must create `AdminActionLog`.

## 7.6 Completion

Order may be completed when:

- shipment is delivered, or
- user scans QR to confirm receipt, or
- admin manually completes with reason.

---

## 8. Backend Module Plan

Recommended NestJS modules:

```text
src/
  app.module.ts
  common/
    decorators/
    filters/
    guards/
    interceptors/
    pipes/
    utils/
  config/
  prisma/
  auth/
  users/
  admins/
  orders/
  packages/
  inbound/
  images/
  storage/
  exceptions/
  payments/
  shipments/
  qr/
  notifications/
  address/
  recommendations/
  audit/
  health/
  jobs/
```

---

## 9. Module Requirements

## 9.1 Auth Module

### User WeChat Login

Endpoint:

```text
POST /auth/wechat-login
```

Input:

```json
{
  "code": "wx_login_code",
  "nickname": "optional",
  "avatarUrl": "optional"
}
```

Output:

```json
{
  "accessToken": "jwt",
  "user": {
    "id": "uuid",
    "userCode": "1023",
    "nickname": "张三",
    "avatarUrl": "https://..."
  }
}
```

Requirements:

- Call WeChat `code2Session`.
- Use `openid` as primary identity.
- Create user if not exists.
- Update nickname/avatar if provided.
- Return JWT.

### Admin Login

Endpoint:

```text
POST /auth/admin-login
```

Input:

```json
{
  "username": "admin",
  "password": "password"
}
```

Output:

```json
{
  "accessToken": "jwt",
  "admin": {
    "id": "uuid",
    "role": "ADMIN",
    "displayName": "Warehouse Admin"
  }
}
```

Requirements:

- Use password hash.
- Never return password hash.
- Include role in JWT.

---

## 9.2 Users Module

Endpoints:

- `GET /user/profile`
- `GET /admin/users`
- `GET /admin/users/:id`

Requirements:

- User can only read own profile.
- Admin can search users by `user_code`, nickname, openid partial if enabled.
- Do not expose raw sensitive data unless needed.

---

## 9.3 Orders Module

Endpoints:

- `GET /orders`
- `GET /orders/:id`
- `POST /admin/orders`
- `PATCH /admin/orders/:id/status`
- `PATCH /admin/orders/:id/payment-status`

Requirements:

- User endpoints return only own orders.
- Admin endpoints can search/filter all orders.
- Status changes must validate allowed transition.
- Admin status changes must log before/after state.

---

## 9.4 Packages Module

Endpoints:

- `GET /packages/:id`
- `POST /admin/packages/inbound`
- `PATCH /admin/packages/:id`
- `POST /packages/:id/confirm`
- `POST /packages/:id/issue`

Requirements:

- User can view only packages under own orders.
- Admin can create inbound package.
- Weight/dimension changes recalculate volume weight.
- Confirm/issue endpoints must enforce ownership.

---

## 9.5 Images / Storage Module

Endpoints:

- `POST /admin/images/upload-url`
- `POST /images/metadata`
- `GET /images/:id/signed-url`
- `DELETE /admin/images/:id`

Requirements:

- Generate storage path server-side.
- Use allowed image types only.
- Store metadata in DB.
- Return signed URL or safe public URL based on bucket policy.
- Never expose Supabase service key.

---

## 9.6 Exceptions Module

Endpoints:

- `POST /packages/:id/issue`
- `GET /admin/exceptions`
- `GET /admin/exceptions/:id`
- `PATCH /admin/exceptions/:id`

Requirements:

- Issue creation sets order/package to `EXCEPTION`.
- Admin can set exception to `PROCESSING` or `RESOLVED`.
- Resolving exception may move package/order back to appropriate state.

---

## 9.7 Payment Module

Endpoints:

- `PATCH /admin/orders/:id/payment-status`

Requirements:

- Admin only.
- Input must include status and optional reason.
- If marking `PAID`, set `confirmedAt`.
- Write `PaymentRecord`.
- Write `AdminActionLog`.

---

## 9.8 Shipment Module

Endpoints:

- `POST /admin/shipments`
- `GET /shipments/:orderId`
- `PATCH /admin/shipments/:id`

Requirements:

- User can read only own shipment.
- Admin can create shipment only if paid, unless override.
- Store provider and tracking number.
- Store raw payload JSON for future logistics provider integration.

---

## 9.9 QR Module

Endpoints:

- `POST /admin/orders/:id/qr`
- `POST /qr/scan`

Requirements:

- QR token should not expose raw order ID without signed token.
- Store token hash, not raw token if possible.
- Scan endpoint checks:
  - token valid
  - token not expired
  - scan user is original order owner
- If unauthorized scan, log but do not change business state.

---

## 9.10 Notifications Module

V1 may only create internal notification records.

Future WeChat subscription messages should use:

- package inbound
- pending confirmation
- pending payment
- shipped
- exception update

Requirements:

- Do not send notifications from random modules directly.
- Use a notification service abstraction.

---

## 9.11 Address Module

Endpoint:

- `GET /warehouse-address`

Requirements:

- Return current warehouse receiving address.
- Include formatted address string for copy/paste.
- Include instruction text for Taobao/JD usage.
- Address may include user-specific suffix using `user_code`.

---

## 9.12 Recommendations Module

Endpoints:

- `GET /public/recommendations`
- `GET /public/recommendations/:slug`
- `GET /admin/recommendations`
- `POST /admin/recommendations`
- `PATCH /admin/recommendations/:id`

Requirements:

- Public endpoints return only published content.
- Admin endpoints can manage drafts.
- Support category, city, tags, slug, title, summary, body.
- This module must not depend on logistics modules.

---

## 10. Security Requirements

## 10.1 Authentication

Use JWT for:

- Mini Program user sessions
- Admin sessions

JWT payload should include:

For user:

```json
{
  "sub": "user_id",
  "type": "USER",
  "openid": "wechat_openid"
}
```

For admin:

```json
{
  "sub": "admin_id",
  "type": "ADMIN",
  "role": "ADMIN"
}
```

## 10.2 Authorization

Implement guards:

- `JwtAuthGuard`
- `AdminGuard`
- `SuperAdminGuard`
- ownership checks for user resources

## 10.3 Sensitive Operation Logging

Must log:

- payment status changes
- order status changes
- forced shipment
- exception resolution
- QR generation
- admin user changes
- image deletion

## 10.4 Secrets

Secrets must come from env variables only.

Do not commit:

- `.env.local`
- `.env.production`
- Supabase service role key
- WeChat app secret
- JWT secret
- admin password hashes generated manually

---

## 11. Calculation Requirements

## 11.1 Volume Weight

```text
volume_weight = length_cm * width_cm * height_cm / 6000
```

## 11.2 Chargeable Weight

```text
chargeable_weight = max(actual_weight, volume_weight)
```

## 11.3 Order Totals

Order totals should be recomputed when:

- package weight changes
- package dimension changes
- package added
- package removed/cancelled
- pricing rule changes and admin triggers recalculation

---

## 12. Error Handling

Use consistent error format:

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found",
    "details": {}
  }
}
```

Common codes:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `INVALID_STATE_TRANSITION`
- `ORDER_NOT_PAID`
- `RESOURCE_OWNERSHIP_MISMATCH`
- `UPLOAD_URL_FAILED`
- `WECHAT_LOGIN_FAILED`

---

## 13. Observability

Minimum:

- `GET /health`
- structured logs for requests
- structured logs for admin actions
- log request ID if possible

Future:

- CloudWatch logs
- Sentry
- uptime monitor
- queue metrics

---

## 14. Acceptance Criteria

Backend MVP is complete when:

1. User can login through WeChat login API with mocked or real code exchange.
2. Admin can login.
3. Admin can create order for user.
4. Admin can create inbound package with weight/dimensions/images.
5. User can view own order/package.
6. User can confirm package.
7. User can report issue.
8. Admin can update payment status.
9. Admin can create shipment after payment.
10. Admin override works with reason and audit log.
11. Image metadata is stored.
12. Supabase Storage upload path is controlled by backend.
13. Prisma migrations are clean.
14. Docker production build runs.
15. `/health` endpoint works.

---

## 15. Windsurf Development Guidance

When working on `backend/`, read these files first:

```text
docs/prd.md
docs/architecture.md
docs/api_contract.md
backend/docs/prd.md
backend/docs/api.md
backend/docs/database.md
backend/docs/deployment.md
```

Rules for Windsurf:

1. Only modify `backend/` unless explicitly asked.
2. Keep API responses consistent with `backend/docs/api.md`.
3. Use Prisma schema from `backend/docs/database.md`.
4. Keep deployment compatible with `backend/docs/deployment.md`.
5. Do not hardcode secrets.
6. Add DTO validation for every request body.
7. Add ownership checks for every user-facing resource.
8. Add admin logs for sensitive operations.
