# Admin CRUD Implementation — Phase 2 + 3

> Updated: 2026-05-06

## Overview

Full admin CRUD for **all 6 entities** (Customers, Customer Registrations, Inbound Packages, Customer Shipments, Master Shipments, Transactions) is implemented with:
- List pages with search, status filters, pagination, mobile card view
- Detail pages with edit, status update, and special actions
- Create modals on list pages
- Hard delete with confirmation dialog (type "DELETE" to confirm)
- Delete blockers display (409 responses with dependency counts)
- Error display with `requestId` for debugging
- Success/failure feedback on all mutations
- Mobile-responsive layout (drawer sidebar, stacked cards on mobile)

---

## API Client Enhancements

### Request ID & Logging (`src/lib/api/client.ts`)

- Every request generates a unique `X-Request-Id` header (UUID v4 or timestamp fallback)
- Backend echoes it back as `x-request-id` response header (CORS-exposed)
- Console logging (when `NEXT_PUBLIC_API_DEBUG=true` or `NODE_ENV=development`):
  - `[API:start]` — requestId, method, url, hasBody, hasToken
  - `[API:success]` — requestId, backendRequestId, status, durationMs
  - `[API:error]` — requestId, backendRequestId, status, durationMs, message
- **Never logs**: tokens, passwords, Authorization header values
- `ApiError` now carries `requestId` and `backendRequestId` for UI display

### Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.gjxpress.net
NEXT_PUBLIC_API_DEBUG=true  # optional, defaults based on NODE_ENV
```

---

## Admin API Wrapper (`src/lib/api/admin.ts`)

### Customers
| Method | Function |
|--------|----------|
| GET `/admin/customers` | `adminApi.getCustomers(params)` |
| GET `/admin/customers/:id` | `adminApi.getCustomerById(id)` |
| POST `/admin/customers` | `adminApi.createCustomer(data)` |
| PATCH `/admin/customers/:id` | `adminApi.updateCustomer(id, data)` |
| PATCH `/admin/customers/:id/disable` | `adminApi.disableCustomer(id)` |

### Inbound Packages
| Method | Function |
|--------|----------|
| GET `/admin/inbound-packages` | `adminApi.getInboundPackages(params)` |
| GET `/admin/inbound-packages/:id` | `adminApi.getInboundPackageById(id)` |
| POST `/admin/inbound-packages` | `adminApi.createInboundPackage(data)` |
| PATCH `/admin/inbound-packages/:id` | `adminApi.updateInboundPackage(id, data)` |
| PATCH `/admin/inbound-packages/:id/assign-customer` | `adminApi.assignCustomerToPackage(id, data)` |
| PATCH `/admin/inbound-packages/:id/status` | `adminApi.updateInboundPackageStatus(id, data)` |
| GET `/admin/inbound-packages/:id/images` | `adminApi.listInboundPackageImages(id)` |
| POST `/admin/inbound-packages/:id/images` | `adminApi.uploadInboundPackageImage(id, file)` — multipart/form-data |
| DELETE `/admin/inbound-packages/:id/images?imageUrl=...&confirm=DELETE_HARD` | `adminApi.deleteInboundPackageImage(id, imageUrl)` |

### Customer Shipments
| Method | Function |
|--------|----------|
| GET `/admin/customer-shipments` | `adminApi.getCustomerShipments(params)` |
| GET `/admin/customer-shipments/:id` | `adminApi.getCustomerShipmentById(id)` |
| POST `/admin/customer-shipments` | `adminApi.createCustomerShipment(data)` |
| PATCH `/admin/customer-shipments/:id` | `adminApi.updateCustomerShipment(id, data)` |
| PATCH `/admin/customer-shipments/:id/cancel` | `adminApi.cancelCustomerShipment(id)` |
| PATCH `/admin/customer-shipments/:id/status` | `adminApi.updateCustomerShipmentStatus(id, data)` |
| PATCH `/admin/customer-shipments/:id/payment-status` | `adminApi.updateCustomerShipmentPaymentStatus(id, data)` |
| POST `/admin/customer-shipments/:id/items` | `adminApi.addItemToShipment(id, data)` |
| DELETE `/admin/customer-shipments/:id/items/:itemId` | `adminApi.removeItemFromShipment(shipmentId, itemId)` |
| GET `/admin/customer-shipments/:id/images` | `adminApi.listCustomerShipmentImages(id)` |
| POST `/admin/customer-shipments/:id/images` | `adminApi.uploadCustomerShipmentImage(id, file)` — multipart/form-data |
| DELETE `/admin/customer-shipments/:id/images?imageUrl=...&confirm=DELETE_HARD` | `adminApi.deleteCustomerShipmentImage(id, imageUrl)` |

---

## Admin Routes

| Route | File | Features |
|-------|------|----------|
| `/admin/login` | `(admin)/admin/login/page.tsx` | Phone+password login |
| `/admin` | `(admin)/admin/page.tsx` | Dashboard with quick links |
| `/admin/customers` | `(admin)/admin/customers/page.tsx` | List + search + status filter + create modal |
| `/admin/customers/[id]` | `(admin)/admin/customers/[id]/page.tsx` | Detail + edit + disable |
| `/admin/inbound-packages` | `(admin)/admin/inbound-packages/page.tsx` | List + search + status filter + create modal with image upload |
| `/admin/inbound-packages/[id]` | `(admin)/admin/inbound-packages/[id]/page.tsx` | Detail + assign customer + status + image upload/preview/delete |
| `/admin/customer-shipments` | `(admin)/admin/customer-shipments/page.tsx` | List + search + status filter + create modal with billing fields, images, default notes |
| `/admin/customer-shipments/[id]` | `(admin)/admin/customer-shipments/[id]/page.tsx` | Detail + billing fields + status + payment status + image upload/preview/delete + cancel |
| `/admin/master-shipments` | `(admin)/admin/master-shipments/page.tsx` | List + search + filters + create modal with customerShipmentIds multi-select + mobile cards |
| `/admin/master-shipments/[id]` | `(admin)/admin/master-shipments/[id]/page.tsx` | Detail + edit + status + publication + CS management + hard delete |
| `/admin/transactions` | `(admin)/admin/transactions/page.tsx` | List + type/payment filters + create modal + mobile cards |
| `/admin/transactions/[id]` | `(admin)/admin/transactions/[id]/page.tsx` | Detail + edit amount/status + hard delete |

---

## Auth & Route Guard

- Token stored in `localStorage` as `gjx_admin_access_token`
- User info in `gjx_admin_user`
- `(admin)/layout.tsx` checks auth on mount, redirects to `/admin/login` if missing
- `adminApiFetch` auto-attaches Bearer token, handles 401 → clear + redirect
- Login page is exempt from auth guard check

---

## UI Patterns

1. **Error states** show error message + requestId (when available) + retry button
2. **Create modals** are inline in list pages with form validation + anti-duplicate submit
3. **Success messages** display green banner with relevant info (e.g., customer code, shipment number)
4. **Loading** uses animated spinner (Loader2 from lucide-react)
5. **Status badges** use color-coded pills from `components/common/StatusBadge.tsx`
6. **Amount formatting** uses `formatAmountCents()` from `src/lib/format.ts` (cents → `¥25.00`)
7. **Yuan input** uses `parseDollarsToCents()` / `centsToYuan()` for CNY conversions
8. **Image components** (`components/admin/ImageManager.tsx` + `components/common/ImagePreviewModal.tsx`):
   - `ImagePicker` — button triggering file input (accept=image/*, capture=environment, multiple)
   - `LocalImageList` — grid preview of selected local files with remove, uses `URL.createObjectURL`
   - `ServerImageGrid` — grid of uploaded images with preview modal, delete confirmation, and upload button
   - `ImagePreviewModal` — fullscreen modal with open-in-new-tab link
9. **Default notes** — Customer shipment create form auto-generates notes with CN/US West timestamps via `Intl.DateTimeFormat`
10. **Customer shipment multi-select** — Master shipment create form fetches unbatched customer shipments, shows searchable checkbox list with chips for selected items

---

## Hard Delete (`DeleteConfirmDialog`)

Component: `src/components/common/DeleteConfirmDialog.tsx`

Features:
- User must type "DELETE" to enable the confirm button
- Displays entity label being deleted
- Shows blocker counts from 409 responses (e.g., "关联入库包裹: 3")
- Loading spinner while delete is in progress
- Error display with requestId

All 5 entities support hard delete via `?confirm=DELETE_HARD` query param:
- `adminApi.hardDeleteCustomer(id)`
- `adminApi.hardDeleteInboundPackage(id)`
- `adminApi.hardDeleteCustomerShipment(id)`
- `adminApi.hardDeleteMasterShipment(id)`
- `adminApi.hardDeleteTransaction(id)`

---

## Mobile Responsiveness

- **Admin layout** (`(admin)/layout.tsx`): drawer sidebar on mobile, fixed sidebar on desktop
- **List pages**: header stacks vertically on mobile, tables hidden on mobile → card list shown instead
- **Detail pages**: padding adjusts (`p-4 md:p-6`), grids go single-column on mobile
- **Filters/search**: stack vertically on mobile (`flex-col sm:flex-row`)
- **Buttons**: full-width on mobile (`w-full sm:w-auto`)

---

## Known Lint Notes

React 19 compiler warns about `setState` called within `useEffect` for data fetching patterns. This is functionally correct — it's the standard client-side data fetching pattern. The warning is a recommendation to use React Server Components or `use()` for data fetching, which doesn't apply to authenticated admin pages that rely on client-side tokens.

`<img>` element warnings in `ImageManager.tsx` and `ImagePreviewModal.tsx` are intentional — these render external Supabase Storage URLs that cannot be optimized by `next/image`.
