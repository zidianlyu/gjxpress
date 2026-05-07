# Frontend Architecture - GJXpress / 广骏供应链服务

## 1. Purpose

This document defines the frontend architecture and component structure for the GJXpress Next.js application.

---

## 2. Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Public route group
│   │   │   ├── page.tsx
│   │   │   ├── services/
│   │   │   ├── tracking/
│   │   │   ├── register/
│   │   │   ├── contact/
│   │   │   ├── compliance/
│   │   │   ├── privacy/
│   │   │   ├── terms/
│   │   │   ├── compensation/
│   │   │   └── disclaimer/
│   │   ├── (admin)/                  # Admin route group
│   │   │   └── admin/
│   │   ├── layout.tsx                # Root layout
│   │   ├── robots.ts                 # Robots.txt
│   │   └── sitemap.ts                # Sitemap.xml
│   ├── components/
│   │   ├── seo/                      # SEO components
│   │   │   └── JsonLd.tsx            # JSON-LD structured data
│   │   ├── layout/                   # Layout components
│   │   ├── common/                   # Shared components
│   │   └── public/                   # Public page components
│   ├── lib/
│   │   ├── site-config.ts            # Site configuration
│   │   ├── seo.ts                    # Metadata helpers
│   │   └── structured-data.ts        # Structured data helpers
│   └── types/
│       ├── admin.ts                  # Admin types
│       └── public.ts                 # Public types
├── docs/                             # Documentation
└── package.json
```

---

## 3. SEO Infrastructure

### 3.1 Site Configuration

**File:** `lib/site-config.ts`

Centralized site configuration used across the application:

```typescript
export const siteConfig = {
  name: "广骏国际快运",
  legalName: "广骏供应链服务",
  englishName: "GJXpress",
  slogan: "看得见的跨境物流",
  domain: "gjxpress.net",
  url: "https://gjxpress.net",
  description: "...",
  locale: "zh_CN",
  serviceAreas: ["Santa Clara", "San Jose", "Milpitas", "Fremont"],
  publicContacts: {
    domestic: {
      label: "国内联系人",
      name: "冯老板",
      phone: "+86 139-2903-5086",
      phoneHref: "tel:+8613929035086",
      wechat: "FENG13929035086",
    },
    us: {
      label: "美国联系人",
      name: "小吕",
      phone: "+1 951-660-1736",
      phoneHref: "tel:+19516601736",
      wechat: "zidianlyu",
    },
    note: "添加微信或联系时，请注明：“咨询广骏中美快运”",
  },
};
```

### 3.2 Metadata System

**File:** `lib/seo.ts`

Standardized metadata generation:

```typescript
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "页面标题｜广骏国际快运",
  description: "页面描述...",
  path: "/page-path",
});
```

**Features:**

- Automatic title suffix with site name
- Canonical URL generation
- OpenGraph and Twitter Card support
- Robots metadata control

### 3.3 Structured Data System

**Files:**

- `components/seo/JsonLd.tsx` - JSON-LD component
- `lib/structured-data.ts` - Structured data helpers
- `lib/faq.ts` - FAQ data and categorization
- `components/public/FaqSection.tsx` - FAQ section component
- `components/public/FaqAccordion.tsx` - FAQ accordion component
- `app/layout.tsx` - Global Organization/LocalBusiness schemas
- `public/icon.svg` - Site icon and favicon
- `app/opengraph-image.png` - OG image for social sharing
- `app/twitter-image.png` - Twitter card image

**Component Usage:**

```typescript
import JsonLd from '@/components/seo/JsonLd';
import { buildOrganizationJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';

export default function Page() {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '页面名称', path: '/page' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      {/* Page content */}
    </>
  );
}
```

**Available Helpers:**

- `buildOrganizationJsonLd()` - Organization schema
- `buildLocalBusinessJsonLd()` - LocalBusiness schema
- `buildBreadcrumbJsonLd(items)` - BreadcrumbList schema
- `buildFaqJsonLd(faqs)` - FAQPage schema (implemented)

---

## 4. Route Architecture

### 4.1 Route Groups

**Public Routes (`(public)/`)**

- SEO-optimized pages with structured data
- Standardized metadata via `buildMetadata()`
- Breadcrumb JSON-LD on all pages
- No authentication required

**Admin Routes (`(admin)/`)**

- Admin dashboard and management pages
- `noindex, nofollow` metadata
- No structured data injection
- Authentication required

### 4.2 Layout Hierarchy

```
app/layout.tsx (Root Layout)
├── Global Organization JSON-LD
├── Global LocalBusiness JSON-LD
└── Route-specific layouts
    ├── (public)/layout.tsx (if exists)
    │   └── Public pages with breadcrumbs
    └── (admin)/layout.tsx
        └── Admin pages with noindex
```

### 4.3 Admin API Data Rules

Admin API wrappers live in `src/lib/api/admin.ts` and use `adminApiFetch`, which attaches the stored Bearer token, clears it on 401, and redirects to `/admin/login`. Debug logs retain request metadata and never print token, password, or Authorization header values.

List wrappers normalize backend pagination shape before data reaches pages. The normalized shape is `{ items, page, pageSize, total, totalPages }`.

Supported backend shapes include top-level `{ items, page, pageSize, total }`, nested `{ data: { items, ... } }`, legacy nested `{ items, pagination }`, uncommon `{ item: ... }`, and plain arrays.

Status labels are centralized in `src/lib/constants/status.ts`. Inbound package and customer shipment UI submit only canonical simplified statuses while retaining display compatibility for old enum values during migration.

Admin-facing customer identity uses `customerCode` such as `GJ3178`. Internal `customerId` UUID values are backend foreign keys and should not be presented as customer numbers. Admin create forms must not ask for or submit `customerId` unless an endpoint explicitly requires an internal id.

Formal Customer records no longer have a `status` field in frontend types, forms, list filters, detail displays, or PATCH payloads. `/admin/customers` and `/admin/customers/:id` show contact fields only and do not expose disable/enable actions. CustomerRegistration review records also no longer expose `status` in frontend types or admin UI; `/admin/customer-registrations` and `/admin/customer-registrations/:id` do not display status, filter by status, or submit status in PATCH/approve payloads. This does not apply to logistics entity statuses.

`src/components/admin/CustomerCodeInput.tsx` is the reusable admin customer-code input. It renders a fixed left `GJ` segment and lets admins enter only four digits. The component value and parent form state always use the full code (`""` or `GJ3178`), so payloads can submit `customerCode` directly.

Admin customer shipment create submits `customerCode`; the backend resolves it to the internal `customer_id` UUID FK. Customer shipments include `shipmentType`, with internal values `AIR_GENERAL`, `AIR_SENSITIVE`, and `SEA`, displayed as `空运普货`, `空运敏货`, and `海运`. The shared helper is `src/lib/shipment-types.ts` and is reused by CustomerShipment, MasterShipment, and Transaction admin UI. Customer shipment decimal fields (`actualWeightKg`, `billingRateCnyPerKg`, and `billingWeightKg`) are sent as trimmed strings in API payloads. The displayed payable amount is `billingRateCnyPerKg * billingWeightKg`, formatted as CNY when both decimal strings are valid.

Customer shipment create notes end with exactly one `应付费用：...` line. If the amount can be calculated, the line uses the formatted payable amount; otherwise it uses `应付费用：待确认`.

Customer shipment payment status UI displays and submits only `UNPAID`, `PAID`, and `REFUNDED`, shown to admins as `未支付`, `已支付`, and `已退款`. Legacy `PENDING`, missing values, and empty values display as `未支付`; legacy `REFUND` displays as `已退款`. Saving from the detail page always submits the new canonical values only.

Customer and CustomerRegistration frontends do not expose or submit notes. Public registration collects only contact fields and privacy consent. Admin registration review allows editing contact fields, approving, or deleting the application. The registration delete action is labeled `删除申请`, uses the hard delete API (`DELETE /admin/customer-registrations/:id?confirm=DELETE_HARD`), and does not require typed `DELETE` confirmation in that specific review-detail flow.

New customer review flow is: Public registration → Admin review → approve creates a formal Customer → backend hard deletes the CustomerRegistration. After approval, the frontend always redirects to `/admin/customers`. It must not redirect to `/admin/customers/:id`, stay on the registration detail, or re-fetch the deleted registration.

Inbound package create requires a valid `customerCode` (`GJ` plus four digits). Admins enter only the four digits through `CustomerCodeInput`; the frontend payload submits the full business code such as `GJ1736`. When the backend reports a missing customer for that submitted code, the create modal shows `客户 GJ1736 不存在，请核实后重试。` without a Request ID. Unknown API errors may still show Request ID for troubleshooting.

InboundPackage admin remarks use the single `note` field. The frontend no longer submits or renders inbound package `adminNote` / `issueNote`; during backend transition, detail hydration may display an old returned value as `note`, but PATCH/POST payloads use only `note`.

`/tracking` is the public combined order query and batch update page. Batch updates load from the public backend API `GET /tracking/batch-updates?limit=10`, never from admin endpoints and never with an admin token. The UI tolerates raw arrays, `{ items }`, `{ data: { items } }`, `{ item }`, and `{ result }` shapes, and displays only low-sensitivity master shipment fields such as `shipmentType`, `vendorName`, `vendorTrackingNo`, status, timestamps, and aggregate shipment count. It does not display customer lists, customer codes, internal UUIDs, phone, WeChat, addresses, images, transactions, or admin notes.

Public tracking queries normalize input with trim and uppercase, support shipment numbers such as `GJS20260507267`, and call the public tracking API with `q`. Results display `shipmentNo` and low-sensitivity logistics state only.

`支付订单` is the Admin display name for `/admin/transactions`; backend API paths and model names may still use `transactions`. TransactionRecord no longer has its own `type`; order transport type is always displayed from `transaction.customerShipment.shipmentType`. The frontend does not implement online payment, payment links, or payment QR codes. Admins can create an order only from an unpaid customer shipment via the `支付` action. The modal title is `新建订单`, displays the business shipment number label `集运单号` such as `GJS20260507267`, hides the raw `customerShipmentId` from the admin, and keeps that internal id only in the create payload. It displays the shipment transport type as read-only information and displays amount as read-only, calculated from `billingRateCnyPerKg * billingWeightKg`. If the amount cannot be calculated, creation is disabled and admins must edit the shipment billing fields first. Create payloads use `{ customerShipmentId, amountCents, adminNote? }`, and must not submit `type`, `customerId`, or `customerCode`; the backend derives customer linkage from `customerShipmentId`. After successful creation from `/admin/customer-shipments`, the modal closes, resets, and redirects to `/admin/transactions`; failed creation keeps the modal open with entered values. `/admin/transactions` remains a list/detail area and does not expose a top-right create button.

Transaction detail displays customer identity from `customerCode`, shipment identity from `shipmentNo`, and transport type from `customerShipment.shipmentType`. Its subtitle is `<客户ID>-<MM/DD-HH:mm>-<运输类型>`, for example `GJ5901-05/07-22:14-空运普货`, and never the raw transaction UUID. Amount and transport type are read-only in `基础信息`; the edit area only changes `备注`. Saving a transaction note must PATCH only `{ adminNote }`, then rehydrate the detail response so customer, shipment, amount, shipment type, and timestamps remain authoritative. Hard deleting a transaction calls `DELETE /admin/transactions/:id?confirm=DELETE_HARD`, then returns to `/admin/transactions`; the backend resets the related customer shipment `paymentStatus` to `UNPAID`.

MasterShipment transport type uses the same `shipmentType` values and labels as CustomerShipment: `AIR_GENERAL` / `AIR_SENSITIVE` / `SEA` for `空运普货` / `空运敏货` / `海运`. MasterShipment status displays only `运输中`, `已签收`, `待客人领取`, and `异常`, backed by `IN_TRANSIT`, `SIGNED`, `READY_FOR_PICKUP`, and `EXCEPTION`; legacy status values normalize into those labels.

The new international batch form labels transport as `运输类型`, keeps supplier as a select (`DHL`, `UPS`, `FEDEX`, `EMS`, `OTHER`), does not expose a status field, and submits `{ shipmentType, vendorName, vendorTrackingNo, customerShipmentIds }`. The customer shipment selector displays each option as `<集运单号> <客户code> <运输类型>`, falls back to `未生成单号` and `未知客户`, and only offers customer shipments that are unbatched, `PAID`, and the same `shipmentType` as the form. The frontend sends `unbatched=true`, `shipmentType`, and `paymentStatus=PAID`, keeps a local filter fallback, clears selected shipments when transport type changes, and validates selected shipment type and payment status again before submit. After create succeeds, the backend updates linked CustomerShipment records to `SHIPPED`; the frontend closes the modal, resets form state, clears cached candidates, and refreshes the master shipment list so any displayed customer shipment status can show `已发货`.

MasterShipment detail treats transport type, supplier, supplier tracking number, status, and associated customer shipments as read-only basic information. Associated customer shipments are listed line by line as `<集运单号> · <客户编号> · <运输类型> · <费用状态> · <运输状态>` without raw UUIDs. The page no longer supports adding or removing associated shipments from the detail view; admin can only edit the batch note, and saving sends `{ note }`.

MasterShipment public publishing uses `publicPublished` with a single `公开发布` / `撤销发布` action. `publicTitle`, `publicSummary`, and `publicStatusText` are removed from frontend admin state, payloads, and types. Public `/tracking` should only show published batches returned by the public backend API.

Deleting a MasterShipment is allowed even when it has associated customer shipments; the backend detaches those links. The frontend still calls `DELETE /admin/master-shipments/:id?confirm=DELETE_HARD`, shows blocking loading while deleting, and returns to `/admin/master-shipments`. If the response includes `detachedCustomerShipmentCount`, the list page displays the detached count.

Deleting a paid CustomerShipment is blocked in the frontend with `当前集运单已支付，若要删除，请先删除对应的支付订单。`; if the backend returns a payment/transaction blocker, the same message is shown without exposing the Request ID for that known case. Admins must delete the corresponding payment order first so the shipment payment status returns to unpaid before deleting the shipment.

All entity hard delete flows use a full-page blocking loading overlay after the admin confirms deletion and before the API returns. This covers customer registrations, customers, inbound packages, customer shipments, master shipments, and transactions. Delete confirmation dialogs do not require typed `DELETE`, but API calls still include `confirm=DELETE_HARD`.

Inbound package and customer shipment hard deletes are entity deletes only: the frontend calls the backend `?confirm=DELETE_HARD` endpoint through `adminApi`, and backend storage cleanup deletes any uploaded images. The frontend must not compute storage object paths or delete storage directly. Master shipment, transaction, customer shipment, and inbound package detail hard delete dialogs do not require typing `DELETE`, but the API call still includes `confirm=DELETE_HARD`.

Customer shipments do not support cancellation in Admin UI. Problem cases should be handled by updating the shipment status to `EXCEPTION` or another existing status.

Admin detail pages must hydrate from their detail APIs on page load using route params, not from list-page state. This keeps `/admin/customers/:id` and `/admin/inbound-packages/:id` refresh-safe and direct-link safe.

Admin detail pages must unwrap detail API responses before storing entity state. Backend detail responses may arrive as a raw object, `{ item }`, or `{ data }`; pages should use the shared unwrap helper instead of putting wrapper objects into state.

When displaying a shortened id, use `safeShortId()` instead of calling `value.slice(...)` directly. Detail pages should fall back to the route id or `未编号` when the entity id is missing.

Admin create modals close and reset after successful creation, then refresh the list. If the create request fails, the modal remains open and keeps the admin's entered values.

Inbound package and customer shipment create modals use a full-page blocking loading overlay while creating records, uploading selected images, and refreshing lists. During that state admins cannot close the modal, click cancel, remove selected files, submit again, or interact with the underlying page. The overlay text should reflect progress such as `正在创建记录...`, `正在上传图片 2 / 5...`, and `正在刷新列表...`. On failure, the overlay disappears and the modal keeps form values and local image selections.

Inbound package image uploads must only run after create returns a real package `id`. If the create response does not include an id in raw object, `{ item }`, or `{ data }`, the frontend stops image upload and shows an explicit error instead of calling `/undefined/images`.

Customer shipment image uploads follow the same rule: create first through the backend API, extract a real shipment `id`, then upload images through `/admin/customer-shipments/:id/images`.

Master shipments include `shipmentType` in create and update payloads. Valid internal values are `AIR_GENERAL`, `AIR_SENSITIVE`, and `SEA`, displayed to admins as `空运普货`, `空运敏货`, and `海运`. New batch forms show `类型` at the top, before supplier fields and customer shipment selection. The supplier field is labeled `供应商`, uses a fixed select, and submits `vendorName` as one of `DHL`, `UPS`, `FEDEX`, `EMS`, or `OTHER`; arbitrary free text is not allowed. Lists and detail pages display the supplier value as stored.

Master shipment create uses the admin blocking loading overlay while the create API is pending. During that state admins cannot close the modal, cancel, change selected customer shipments, resubmit, or interact with the underlying admin page. Success closes and resets the modal, clears selected customer shipments, refreshes the list, and shows a success message; failure leaves entered values and selections intact.

Public layout details: `/compensation` uses the shared public container width (`max-w-6xl` with responsive horizontal padding) for the abnormal handling FAQ section so it aligns with surrounding sections. `/compliance` keeps FAQ and related links visible and crawlable but removes their outer bordered wrappers, relying on spacing and internal link cards for separation.

---

## 5. FAQ System

### 5.1 FAQ Data Structure

**File:** `lib/faq.ts`

Centralized FAQ data management:

```typescript
export type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

export const faqData: FaqItem[] = [
  // 20 FAQs across 8 categories
];

export const faqCategories: FaqCategory[] = [
  // Organized by category
];
```

**Categories:**

- 服务流程 (4 FAQs)
- 费用与计费 (3 FAQs)
- 时效 (3 FAQs)
- 品类与合规 (2 FAQs)
- 入库与图片 (3 FAQs)
- 美国段取货 (2 FAQs)
- 异常处理 (2 FAQs)
- 新客户注册 (2 FAQs)

### 5.2 FAQ Components

**FaqAccordion Component (`components/public/FaqAccordion.tsx`)**

- Client component for interactive accordion behavior
- Accessible with proper ARIA attributes
- Mobile-friendly touch interactions
- Smooth expand/collapse animations

**FaqSection Component (`components/public/FaqSection.tsx`)**

- Server component wrapper for FAQ sections
- Supports both categorized and simple FAQ displays
- Consistent styling and layout
- Optional titles and descriptions

### 5.3 FAQ Implementation Pattern

**FAQ Page (`app/(public)/faq/page.tsx`)**

```typescript
import FaqSection from '@/components/public/FaqSection';
import { faqData, faqCategories } from '@/lib/faq';
import { buildFaqJsonLd } from '@/lib/structured-data';

// All FAQs with categories
<FaqSection
  faqs={faqData}
  categories={faqCategories}
  showCategories={true}
/>

// FAQ JSON-LD for all visible FAQs
<JsonLd data={buildFaqJsonLd(faqData)} />
```

**Selected FAQs on Service Pages**

```typescript
import { servicesFaqs } from '@/lib/faq';

// Only relevant FAQs for the page
<FaqSection
  title="服务常见问题"
  faqs={servicesFaqs}
/>

// FAQ JSON-LD only for visible FAQs
<JsonLd data={buildFaqJsonLd(servicesFaqs)} />
```

### 5.4 FAQ Content Guidelines

**Content Principles:**

- Serve users, not keyword stuffing
- No high-risk promises or guarantees
- No fixed prices, timelines, or compensation amounts
- Avoid "包税、保证送达、保证通关、100%安全"
- Answers must be helpful and accurate

**Risk Boundaries:**

- ❌ Fixed pricing promises
- ❌ Guaranteed delivery times
- ❌ Guaranteed customs clearance
- ❌ 100% safety claims
- ✅ Helpful, service-oriented content
- ✅ Accurate process descriptions
- ✅ Proper expectation management

---

## 6. Server/Client Component Architecture

### 6.1 Component Strategy

**Server Components (Preferred):**

- All public content pages: `/`, `/services`, `/faq`, `/compliance`, `/privacy`, `/terms`, `/compensation`, `/disclaimer`
- Static content rendering
- SEO-optimized pages
- Pages without user interaction

**Client Components (Necessary):**

- `/tracking` - Query form with state management
- `/register` - Registration form with API calls
- `SiteHeader` - Mobile menu toggle
- `FaqAccordion` - Interactive accordion
- Admin components - All admin functionality

**Rules:**

- Public content pages should be Server Components
- Only add `'use client'` when absolutely necessary
- Extract interactive parts into separate Client Components
- Never import admin Client Components into public Server Components

### 6.2 Performance Guidelines

**Mobile Layout:**

- Grid layouts start with `grid-cols-1` for mobile
- Forms use responsive flex layouts (`flex-col sm:flex-row`)
- No horizontal overflow on mobile devices
- Sticky header with proper height (h-14)

**Image & Font Performance:**

- Public pages use icon components instead of images
- No next/image usage in public pages (reduces bundle)
- Geist fonts loaded with proper subsets
- No external analytics scripts

**Core Web Vitals:**

- Server Components reduce JavaScript bundle
- Proper image dimensions prevent CLS
- Efficient font loading
- Minimal client-side JavaScript

### 6.3 Address Privacy Rules

**No Public Full Address:**

- Current address is private apartment, not displayed on public website
- siteConfig does not expose full street address in public exports
- Use serviceAreas array instead of complete address
- Footer displays service area list, not street address

**Service Area Configuration:**

```typescript
serviceAreas: [
  'Santa Clara', 'San Jose', 'Milpitas',
  'Fremont', 'Sunnyvale', 'Cupertino', 'Bay Area'
],
publicLocationSummary: '服务 Santa Clara、San Jose、Milpitas、Fremont 及湾区周边客户。',
handoffSummary: '支持本地上门递送或预约交接，具体安排由工作人员确认。'
```

**Structured Data:**

- Organization JSON-LD uses areaServed, not PostalAddress
- LocalBusiness JSON-LD removes streetAddress, postalCode
- No complete address in any public JSON-LD

### 6.4 Public Contacts And App Version

**Public contact configuration:**

- Public contact details are centralized in `src/lib/site-config.ts` under `publicContacts`
- `/contact` is a public indexed contact page and is included in `sitemap.ts`
- Public nav, footer, home page, services page, and register page provide discoverable links to contact information
- Every indexable public page renders `PublicContactStrip` above `PublicFooter` through the `(public)` layout; Admin pages do not use this layout
- The home page renders `PublicContactHighlight` near the hero with both public contacts, clickable telephone links, visible WeChat ids, and the consultation note
- Organization and LocalBusiness JSON-LD include public `contactPoint` telephone values
- The public footer displays domestic and U.S. contacts with name, telephone link, and WeChat id
- Contact content must not include private addresses, payment details, collection QR codes, or high-risk logistics promises
- Public pages may add lightweight contact CTAs, but should avoid fixed pricing, fixed timelines, tax-included claims, or delivery/customs guarantees

### 6.5 Public Nav And Tracking Consolidation

- Public nav uses: 服务介绍, 查询订单, 新客户注册, 联系我们, 管理员
- 合规说明 and 隐私政策 are no longer first-level nav items, but remain crawlable from the public footer and the `/services` related说明 flow
- Logo remains the only home link; there is no separate 首页 nav tab
- The former 查询 and 批次更新 nav entries are merged into 查询订单, linking to `/tracking`
- `/tracking` shows public batch update content at the top and keeps the order/tracking query form below it
- `/batch-updates` and `/batch-updates/:path*` are no longer content routes; `next.config.ts` permanently redirects them to `/tracking`
- Sitemap and footer links exclude `/batch-updates`; do not request indexing for that URL in Google Search Console
- `/compliance` and `/privacy` remain indexable and stay in `sitemap.ts`

**AppVersionBadge:**

- `src/components/common/AppVersionBadge.tsx` is shared by Public and Admin surfaces
- It reads public build-time environment values only and does not call the backend
- Display priority:
  1. `NEXT_PUBLIC_APP_VERSION`
  2. `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`, shortened to 7 characters
  3. `development`
- If both version and commit SHA exist, it renders `版本：v<NEXT_PUBLIC_APP_VERSION> · <shortSha>`
- The Public footer and Admin sidebar both render `AppVersionBadge`
- Vercel production deployments need "Automatically expose System Environment Variables" enabled to make `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` available automatically

**Admin public-home shortcut:**

- The Admin sidebar includes an `打开官网` link
- It points to `/`, opens a new tab, and uses `rel="noopener noreferrer"`

### 6.6 Internal Linking Strategy

**RelatedLinks Component:**

```typescript
// components/public/RelatedLinks.tsx
<RelatedLinks
  links={[
    { label: "服务介绍", href: "/services" },
    { label: "新客户注册", href: "/register" },
  ]}
/>
```

**Link Distribution:**

- Homepage: Core service and registration links
- Services: Registration, tracking, compliance, privacy, terms, compensation, FAQ
- Register: Privacy, services, compliance
- Compliance: Services, privacy, terms, compensation, disclaimer, contact
- FAQ: Services, registration, tracking, compliance

**SEO Benefits:**

- Improved crawlability
- Better user navigation
- Distributed page authority
- Reduced bounce rate

---

## 7. Component Architecture

### 5.1 SEO Components

**JsonLd Component (`components/seo/JsonLd.tsx`)**

```typescript
interface JsonLdProps {
  data: Record<string, any>;
}

// Renders: <script type="application/ld+json" />
```

**Features:**

- Automatic JSON stringification
- Undefined value filtering
- Type-safe structured data

### 5.2 Layout Components

**Root Layout (`app/layout.tsx`)**

- Global metadata configuration
- Organization and LocalBusiness JSON-LD
- Font and styling setup
- HTML structure

**Route Layouts**

- Public: SEO-friendly, structured data
- Admin: Noindex, minimal SEO

---

## 6. Data Flow

### 6.1 Metadata Generation

1. **Site Config** → Provides base site information
2. **Page Metadata** → Uses `buildMetadata()` helper
3. **Structured Data** → Uses `lib/structured-data.ts` helpers
4. **JSON-LD Output** → Rendered via `JsonLd` component

### 6.2 SEO Data Sources

```mermaid
graph TD
    A[site-config.ts] --> B[buildMetadata()]
    A --> C[buildOrganizationJsonLd()]
    A --> D[buildLocalBusinessJsonLd()]
    B --> E[Page Metadata]
    C --> F[Root Layout JSON-LD]
    D --> F
    G[buildBreadcrumbJsonLd()] --> H[Page JSON-LD]
    I[buildFaqJsonLd()] --> H
```

---

## 7. Development Guidelines

### 7.1 Adding New Pages

1. Create page in appropriate route group
2. Use `buildMetadata()` for page metadata
3. Add breadcrumb JSON-LD for public pages
4. Include in `sitemap.ts` if indexable
5. Update documentation in `docs/pages.md`

### 7.2 SEO Best Practices

- Always use `buildMetadata()` helper
- Include breadcrumbs on public pages
- Never add fake ratings, reviews, or contact info
- Ensure structured data matches visible content
- Test JSON-LD output in browser dev tools

### 7.3 Structured Data Rules

- ✅ Organization/LocalBusiness in root layout
- ✅ Breadcrumbs on all public pages
- ❌ FAQ only when actual FAQ content exists
- ✅ Public contactPoint telephone values may be included when they match visible contact content
- ❌ No openingHours or ratings unless verified and visible
- ✅ All data must match page content

---

## 8. Build and Deployment

### 8.1 Build Process

```bash
npm run build        # Next.js build
npm run lint         # ESLint (if configured)
npm run typecheck    # TypeScript (if configured)
```

### 8.2 SEO Verification

After deployment, verify:

- `sitemap.xml` accessible
- `robots.txt` accessible
- JSON-LD scripts in page source
- No admin pages indexed
- Canonical URLs correct

---

## 9. Future Considerations

### 9.1 Potential Enhancements

- FAQ page with FAQPage JSON-LD
- Service area pages with LocalBusiness schemas
- Blog/articles with Article schemas
- Image optimization for SEO

### 9.2 Scalability

- Modular structured data helpers
- Dynamic sitemap generation
- Automated SEO testing
- Performance monitoring

---

## 10. Maintenance

### 10.1 Regular Tasks

- Update structured data when content changes
- Verify JSON-LD validity after major updates
- Monitor search console for structured data errors
- Keep documentation current

### 10.2 Troubleshooting

- Check browser dev tools for JSON-LD output
- Use Google Rich Results Test for validation
- Verify sitemap includes all public pages
- Ensure no admin pages in search results
