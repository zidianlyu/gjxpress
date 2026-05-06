# Frontend Pages Specification - GJXpress / 广骏供应链服务

## 1. Purpose

This document defines the page-level implementation plan for the `frontend/` Next.js application.

It should be used by Windsurf to generate route structure, components, layouts, API integration, and basic UI behavior.

---

## 2. Recommended Route Groups

Use Next.js App Router with route groups:

```text
src/app/
├── (public)/
│   ├── page.tsx
│   ├── services/
│   ├── how-it-works/
│   ├── recommendations/
│   ├── cities/
│   ├── categories/
│   ├── guides/
│   ├── about/
│   └── contact/
├── (admin)/
│   └── admin/
├── robots.ts
├── sitemap.ts
├── layout.tsx
├── not-found.tsx
└── globals.css
```

Note:

- The route group folder name is not part of the URL.
- Public pages should be SEO-friendly.
- Admin pages can be client-heavy.

---

## 3. Shared Application Structure

Recommended file structure:

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── marketing/
│   │   ├── recommendations/
│   │   └── admin/
│   ├── features/
│   │   ├── public-content/
│   │   ├── recommendations/
│   │   └── admin/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── constants/
│   │   ├── formatters/
│   │   ├── seo/
│   │   └── utils/
│   ├── styles/
│   └── types/
├── public/
└── docs/
```

---

## 4. Shared Components

### 4.1 Layout Components

```text
components/layout/SiteHeader.tsx
components/layout/SiteFooter.tsx
components/layout/PublicLayout.tsx
components/layout/AdminLayout.tsx
components/layout/AdminSidebar.tsx
components/layout/AdminTopbar.tsx
```

### 4.2 Common Components

```text
components/common/Button.tsx
components/common/Card.tsx
components/common/Container.tsx
components/common/Section.tsx
components/common/Badge.tsx
components/common/StatusBadge.tsx
components/common/EmptyState.tsx
components/common/ErrorState.tsx
components/common/LoadingState.tsx
components/common/Breadcrumbs.tsx
```

### 4.3 Marketing Components

```text
components/marketing/Hero.tsx
components/marketing/ValueProps.tsx
components/marketing/HowItWorksSteps.tsx
components/marketing/ServiceComparison.tsx
components/marketing/FaqSection.tsx
components/marketing/ContactCta.tsx
components/marketing/WechatQrCard.tsx
```

### 4.4 Recommendation Components

```text
components/recommendations/RecommendationCard.tsx
components/recommendations/RecommendationFilters.tsx
components/recommendations/RecommendationGrid.tsx
components/recommendations/RecommendationDetail.tsx
components/recommendations/RelatedRecommendations.tsx
components/recommendations/CityHero.tsx
components/recommendations/CategoryHero.tsx
```

### 4.5 Admin Components

```text
components/admin/AdminMetricCard.tsx
components/admin/AdminDataTable.tsx
components/admin/OrderStatusBadge.tsx
components/admin/PaymentStatusBadge.tsx
components/admin/PackageImageGallery.tsx
components/admin/AdminFormSection.tsx
components/admin/AdminConfirmDialog.tsx
```

---

## 5. Public Pages

## 5.1 Home Page

Route:

```text
/
```

File:

```text
src/app/(public)/page.tsx
```

Sections:

1. Hero
   - Brand: 广骏供应链服务
   - Display brand: 广骏国际快运
   - Slogan: 看得见的跨境物流
   - CTA: 查看服务流程 / 联系客服

2. Value Props
   - 入库拍照
   - 全程透明
   - 空运/海运效率提升
   - 更高性价比

3. How It Works Preview
   - 4-step summary

4. Service Cards
   - 中美跨境物流
   - 空运
   - 海运
   - 包裹入库确认

5. Recommendation Entry
   - Link to `/recommendations`

6. FAQ

7. Contact CTA

Data:

- Static content initially.
- No backend dependency required for first version.

---

## 5.2 Services Index Page

Route:

```text
/services
```

File:

```text
src/app/(public)/services/page.tsx
```

Sections:

- Page header
- Service overview
- Service cards
- Link to China-US shipping, air freight, sea freight
- CTA

---

## 5.3 China-US Shipping Page

Route:

```text
/services/china-us-shipping
```

File:

```text
src/app/(public)/services/china-us-shipping/page.tsx
```

Sections:

- H1: 中美跨境物流服务
- Who this is for
- Step-by-step workflow
- Trust via inbound photos
- Air vs sea comparison
- FAQ
- CTA

---

## 5.4 Air Freight Page

Route:

```text
/services/air-freight
```

File:

```text
src/app/(public)/services/air-freight/page.tsx
```

Sections:

- H1
- When to choose air freight
- Chargeable weight explanation
- Typical workflow
- CTA

---

## 5.5 Sea Freight Page

Route:

```text
/services/sea-freight
```

File:

```text
src/app/(public)/services/sea-freight/page.tsx
```

Sections:

- H1
- When to choose sea freight
- Large/heavy package use cases
- Consolidation explanation
- CTA

---

## 5.6 How It Works Page

Route:

```text
/how-it-works
```

File:

```text
src/app/(public)/how-it-works/page.tsx
```

Required steps:

```text
1. 复制国内仓地址
2. 在淘宝/京东等平台下单
3. 包裹到达国内仓
4. 仓库拍照、称重、入库
5. 用户在微信小程序确认
6. 管理员安排发货
7. 用户查看物流状态
```

---

## 5.7 About Page

Route:

```text
/about
```

File:

```text
src/app/(public)/about/page.tsx
```

Content:

- Brand story
- Trust and transparency
- Target customer group
- Service philosophy

---

## 5.8 Contact Page

Route:

```text
/contact
```

File:

```text
src/app/(public)/contact/page.tsx
```

Content:

- WeChat contact QR placeholder
- Contact phone/email placeholder
- Business hours
- Service note

Do not build a contact form unless backend API exists.

---

## 6. Recommendation Pages

## 6.1 Recommendation List Page

Route:

```text
/recommendations
```

File:

```text
src/app/(public)/recommendations/page.tsx
```

Query params:

```text
?city=los-angeles&category=chinese-supermarket&q=keyword&page=1
```

UI:

- Page header
- Search field
- City/category filters
- Recommendation grid
- Empty state
- Pagination/load more

Data source:

```text
GET /public/recommendations
```

Suggested response shape:

```ts
type RecommendationListResponse = {
  items: Recommendation[];
  total: number;
  page: number;
  pageSize: number;
};
```

Fallback:

- If API is not ready, create temporary mock data under `src/features/recommendations/mock.ts`.

---

## 6.2 Recommendation Detail Page

Route:

```text
/recommendations/[slug]
```

File:

```text
src/app/(public)/recommendations/[slug]/page.tsx
```

Data source:

```text
GET /public/recommendations/:slug
```

UI sections:

- Breadcrumbs
- Title
- City/category/tags
- Main image optional
- Summary
- Detailed content
- Practical tips
- Related recommendations
- CTA

SEO:

- Implement `generateMetadata`.
- Add canonical URL.
- Add JSON-LD if data is reliable.

---

## 6.3 City Page

Route:

```text
/cities/[city]
```

Examples:

```text
/cities/los-angeles
/cities/new-york
/cities/san-francisco
/cities/seattle
```

File:

```text
src/app/(public)/cities/[city]/page.tsx
```

Data source:

```text
GET /public/recommendations?city=:city
```

UI sections:

- City hero
- City-specific intro
- Recommendations in city
- Related categories
- Service CTA

---

## 6.4 Category Page

Route:

```text
/categories/[category]
```

Examples:

```text
/categories/chinese-supermarket
/categories/local-services
/categories/restaurants
/categories/package-forwarding
```

File:

```text
src/app/(public)/categories/[category]/page.tsx
```

Data source:

```text
GET /public/recommendations?category=:category
```

UI sections:

- Category hero
- Category intro
- Recommendations
- Related cities
- CTA

---

## 7. Guide Pages

Guide pages can be static at first.

Recommended routes:

```text
/guides/how-package-forwarding-works
/guides/chargeable-weight-explained
/guides/air-vs-sea-freight
/guides/restricted-items
/guides/how-to-use-warehouse-address
```

Implementation:

```text
src/app/(public)/guides/[slug]/page.tsx
```

or individual static routes initially.

Each guide page should include:

- H1
- Last updated date
- Table of contents optional
- Main content
- FAQ
- CTA

---

## 8. Admin Pages

## 8.1 Admin Login

Route:

```text
/admin/login
```

File:

```text
src/app/(admin)/admin/login/page.tsx
```

Features:

- Username/password form
- Submit to backend
- Store access token
- Redirect to dashboard

API:

```text
POST /admin/auth/login
```

---

## 8.2 Admin Dashboard

Route:

```text
/admin/dashboard
```

File:

```text
src/app/(admin)/admin/dashboard/page.tsx
```

Metrics:

- Today inbound packages
- Pending confirmations
- Pending payments
- Ready to ship
- Shipped today
- Open exceptions

API:

```text
GET /admin/dashboard/summary
```

If backend endpoint is not ready, use mock data initially.

---

## 8.3 Orders List

Route:

```text
/admin/orders
```

File:

```text
src/app/(admin)/admin/orders/page.tsx
```

Features:

- Table
- Search
- Filters
- Pagination
- Link to detail

API:

```text
GET /admin/orders
```

Query params:

```text
status
paymentStatus
q
page
pageSize
```

---

## 8.4 Order Detail

Route:

```text
/admin/orders/[id]
```

File:

```text
src/app/(admin)/admin/orders/[id]/page.tsx
```

Sections:

- Order summary
- User info
- Package list
- Payment controls
- Shipment controls
- Admin action logs

APIs:

```text
GET /admin/orders/:id
PATCH /admin/orders/:id/payment-status
PATCH /admin/orders/:id/status
```

---

## 8.5 Inbound Packages Page

Route: `/admin/inbound-packages`

File: `src/app/(admin)/admin/inbound-packages/page.tsx`

Features:

- List with search, status filter, pagination
- Create modal with: domesticTrackingNo, customerCode, adminNote, images
- **国内快递单号支持扫码填入**：相机按钮打开扫码 overlay，识别条码后确认填入
- 扫码组件：`src/components/admin/TrackingBarcodeScanner.tsx`
- 候选过滤：`src/lib/tracking-number.ts`
- 详见 `docs/barcode-scanner.md`

APIs:

```text
GET /admin/inbound-packages
POST /admin/inbound-packages
POST /admin/inbound-packages/:id/images
```

---

## 8.6 Exceptions Page

Route:

```text
/admin/exceptions
```

File:

```text
src/app/(admin)/admin/exceptions/page.tsx
```

Features:

- Open exception list
- Filter by status/type
- Link to detail

API:

```text
GET /admin/exceptions
```

---

## 8.7 Admin Logs Page

Route:

```text
/admin/logs
```

File:

```text
src/app/(admin)/admin/logs/page.tsx
```

Features:

- List logs
- Filter by action/admin/date
- View before/after JSON

API:

```text
GET /admin/logs
```

---

## 9. API Client Requirements

Create:

```text
src/lib/api/client.ts
```

Responsibilities:

- Read `NEXT_PUBLIC_API_BASE_URL`
- Attach JWT for admin requests
- Parse JSON
- Throw typed errors
- Support query params

Example shape:

```ts
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
```

Create admin wrapper:

```text
src/lib/api/admin.ts
```

It should attach:

```text
Authorization: Bearer <token>
```

---

## 10. Auth Requirements for Admin

Initial implementation:

- Store admin token in `localStorage`.
- Add `AdminAuthGuard` client wrapper for admin pages.
- Redirect unauthenticated user to `/admin/login`.
- If API returns 401, clear token and redirect.

Future improvement:

- Use httpOnly cookie sessions if needed.

---

## 11. Status Label Mapping

Order statuses:

```ts
export const ORDER_STATUS_LABELS = {
  UNINBOUND: '未入库',
  INBOUNDED: '已入库',
  USER_CONFIRM_PENDING: '待用户确认',
  REVIEW_PENDING: '待审核',
  PAYMENT_PENDING: '待支付',
  PAID: '已支付',
  READY_TO_SHIP: '待发货',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  EXCEPTION: '异常处理中',
};
```

Payment statuses:

```ts
export const PAYMENT_STATUS_LABELS = {
  UNPAID: '未支付',
  PROCESSING: '支付处理中',
  PAID: '已支付',
};
```

Exception statuses:

```ts
export const EXCEPTION_STATUS_LABELS = {
  OPEN: '待处理',
  PROCESSING: '处理中',
  RESOLVED: '已解决',
};
```

---

## 12. Error and Empty States

Every data page should handle:

- Loading
- Empty data
- API error
- Unauthorized
- Network error

Examples:

```text
No recommendations found.
暂无推荐内容
暂无订单
加载失败，请稍后重试
登录已过期，请重新登录
```

---

## 13. Customer Registration Pages (Phase 3)

### 13.1 Public Registration Page

Route: `/register`
File: `src/app/(public)/register/page.tsx`

Features:
- Form fields: phoneCountryCode, phoneNumber, wechatId, domesticReturnAddress, notes
- Privacy consent checkbox (links to /privacy)
- On success: shows customerCode with copy button and "待审核" notice
- No PII exposure from other customers
- Mobile responsive

API: `POST /public/customer-registrations`

### 13.2 Admin Customer Registrations List

Route: `/admin/customer-registrations`
File: `src/app/(admin)/admin/customer-registrations/page.tsx`

Features:
- Table/card list of registrations
- Search by customerCode, phoneNumber, wechatId
- Filter by status (PENDING/APPROVED/REJECTED)
- Pagination
- Create modal for admin-initiated registrations
- Mobile responsive cards

API: `GET /admin/customer-registrations`

### 13.3 Admin Customer Registration Detail

Route: `/admin/customer-registrations/[id]`
File: `src/app/(admin)/admin/customer-registrations/[id]/page.tsx`

Features:
- View/edit registration fields
- Approve → creates formal Customer
- Reject with optional reviewNote
- Hard delete with confirmation dialog
- Link to created customer after approval
- Status badges (PENDING/APPROVED/REJECTED)

APIs:
- `GET /admin/customer-registrations/:id`
- `PATCH /admin/customer-registrations/:id`
- `POST /admin/customer-registrations/:id/approve`
- `POST /admin/customer-registrations/:id/reject`
- `DELETE /admin/customer-registrations/:id?confirm=DELETE_HARD`

### 13.4 Updated Customer Pages

- `/admin/customers` and `/admin/customers/[id]` now include `domesticReturnAddress` field
- Create customer modal includes domesticReturnAddress
- Detail page edit form includes domesticReturnAddress

---

## 14. Deployment Pages Checklist

Before deploying to Vercel:

- [ ] Home page loads
- [ ] Services pages load
- [ ] Recommendations pages load or show mock data
- [ ] Admin login page loads
- [ ] Environment variables configured
- [ ] `sitemap.xml` works
- [ ] `robots.txt` works
- [ ] `/admin` not indexed
- [ ] No backend secret in frontend code
- [ ] API base URL points to `https://api.gjxpress.net`
