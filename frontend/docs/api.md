# Frontend Admin API Notes

Updated: 2026-05-06

The frontend calls the backend through `NEXT_PUBLIC_API_BASE_URL`. `src/lib/env.ts` normalizes the base URL so `/api` is present exactly once and does not hardcode a backend host.

## Pagination Normalize

Admin list wrappers normalize backend list responses into `{ items, page, pageSize, total, totalPages }`.

Accepted backend shapes:

- `{ items, total, page, pageSize, totalPages? }`
- `{ items, pagination: { total, page, pageSize, totalPages } }`
- `T[]`

## Customers

- `listCustomers(params)` calls `GET /admin/customers`.
- Query params: `q`, `status`, `page`, `pageSize`.
- `q` is omitted when blank; `status` is omitted for "全部".
- `updateCustomer(id, payload)` calls `PATCH /admin/customers/:id`.
- `payload.status` supports `ACTIVE` and `DISABLED`.

## Inbound Packages

- `listInboundPackages(params)` calls `GET /admin/inbound-packages` and normalizes pagination.
- `createInboundPackage(payload)` calls `POST /admin/inbound-packages`.
- `domesticTrackingNo` is optional. Empty input is sent as `null`.
- Admin package attribution uses `customerCode`, not `customerId`.
- If `customerCode` is omitted, the package is treated as unidentified.

Canonical statuses:

- `UNIDENTIFIED` -> 未识别
- `ARRIVED` -> 已入库
- `CONSOLIDATED` -> 已合箱

Legacy labels are kept for display compatibility only. Frontend status submissions use canonical values.

## Customer Shipments

- `listCustomerShipments(params)` calls `GET /admin/customer-shipments` and normalizes pagination.
- `createCustomerShipment(payload)` calls `POST /admin/customer-shipments`.
- `quantity` is included in create/update payloads, defaults to `1`, and must be an integer >= 1.
- The create form accepts admin-facing `customerCode` and submits `customerCode` in the create payload. It does not submit admin-entered `customerId`; the backend resolves `customerCode` to the internal `customer_id` UUID FK.
- Decimal fields in create payloads use trimmed strings: `actualWeightKg`, `billingRateCnyPerKg`, and `billingWeightKg`.
- 应付费用 is calculated as `billingRateCnyPerKg * billingWeightKg`.
- Create notes must end with exactly one `应付费用：...` line.
- `updateCustomerShipmentStatus(id, payload)` calls `PATCH /admin/customer-shipments/:id/status`.

Canonical statuses:

- `PACKED` -> 已打包
- `SHIPPED` -> 已发货
- `ARRIVED` -> 已到达
- `READY_FOR_PICKUP` -> 待自提
- `PICKED_UP` -> 已取货
- `EXCEPTION` -> 异常

Legacy labels are kept for display compatibility only. Frontend status submissions use canonical values.
