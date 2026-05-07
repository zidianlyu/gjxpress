# Admin Frontend Rules

Updated: 2026-05-06

## Customer Registrations

`/admin/customer-registrations/[id]` shows formal Customer information when `createdCustomer` exists.

Admins can update the formal Customer status from the registration detail page:

- `ACTIVE` -> 正常
- `DISABLED` -> 停用

This calls `PATCH /admin/customers/:id`. Registration review status remains separate from Customer status.

## Customers

`/admin/customers` displays customerCode, phone, wechatId, domestic return address summary, status, created time, and actions. It does not read or display removed `displayName` customer fields.

## Inbound Packages

Create rules:

- 国内快递单号 is optional.
- Blank tracking input is submitted as `null`.
- 客户编号 input uses `customerCode`, for example `GJ3178`.
- Customer code input shows fixed `GJ`; admins only type four digits. Form state and payload keep the full `GJxxxx` value.
- `customerId` is an internal FK and is not the admin-facing package attribution input.
- Unknown customerCode errors show: `客户编号不存在，请确认后重试。`
- Image upload and barcode scanning remain available in the create flow.
- Create with images uploads only after a real package id is extracted from the create response. If no id is returned, upload is blocked and the page asks the admin to refresh the list.

List/detail display rules:

- Empty domestic tracking number displays `未填写`.
- Missing customer displays `未识别`.
- Customer display uses `customer.customerCode`.

Inbound statuses are simplified to 未识别, 已入库, 已合箱.

## Customer Shipments

Create rules:

- 新建集运单 includes `件数`.
- Default `quantity` is `1`.
- It must be an integer >= 1.
- The frontend submits `quantity` to the backend.
- The form accepts admin-facing `customerCode` and submits `customerCode` in the create payload. `customerId` is an internal UUID FK resolved by the backend and is not an admin input.
- `actualWeightKg`, `billingRateCnyPerKg`, and `billingWeightKg` are submitted as strings.
- 应付费用 is displayed as `billingRateCnyPerKg * billingWeightKg`.
- New shipment notes end with `应付费用：...`, using `待确认` when the amount cannot be calculated.

List/detail/edit display `件数`.

Shipment statuses are simplified to 已打包, 已发货, 已到达, 待自提, 已取货, 异常.

Customer shipments are not cancelled after creation. Admins should use `EXCEPTION` or another existing status for problem handling.

Unpaid customer shipments show a `支付` action. It opens the `新建订单` modal with shipment id, payable amount (`billingRateCnyPerKg * billingWeightKg`), and type `空运普货` / `AIR_GENERAL` prefilled when the amount can be calculated.

`支付订单` is the Admin display name for `/admin/transactions`; API paths remain `/admin/transactions`. The Admin UI does not create payment links or online payment flows.

Inbound package and customer shipment hard deletes call the backend entity DELETE endpoint. Uploaded images are deleted by backend storage cleanup; the frontend does not delete storage objects directly.

Admin detail pages unwrap raw object / `{ item }` / `{ data }` API responses before setting entity state. Short id display uses `safeShortId()`; pages should not call `.slice()` on possibly missing ids.

Admin create modals close and reset after successful creation. Failed creates keep the modal open, preserve entered values, and show the API error/request id. Image uploads only start after the create response contains a real entity id, so `/undefined/images` must never be called.

## Detail Pages

Admin detail pages hydrate directly from backend detail APIs with route params:

- `/admin/customers/:id` calls `GET /admin/customers/:id`
- `/admin/inbound-packages/:id` calls `GET /admin/inbound-packages/:id`

They do not depend on list-page state, so browser refresh and direct links should still populate forms.

No payment entry points or payment call-to-action copy are added in admin pages.
