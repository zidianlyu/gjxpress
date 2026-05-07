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
- `customerId` is an internal FK and is not the admin-facing package attribution input.
- Unknown customerCode errors show: `客户编号不存在，请确认后重试。`
- Image upload and barcode scanning remain available in the create flow.

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
- The form accepts admin-facing `customerCode` and resolves it to backend-required `customerId`.

List/detail/edit display `件数`.

Shipment statuses are simplified to 已打包, 已发货, 已到达, 待自提, 已取货, 异常.

No payment entry points or payment call-to-action copy are added in admin pages.
