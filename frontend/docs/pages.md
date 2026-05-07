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

Route: `/`
File: `src/app/(public)/page.tsx`

Metadata:

- title: `广骏国际快运｜看得见的跨境物流`
- description: 广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务...

Sections:

1. **Hero** — H1: "中国到美国，包裹状态看得见"，副标题描述入库/拍照/合箱/出库/查询/取货。CTA: 查询物流状态(/tracking), 新客户注册(/register), 查看服务介绍(/services)
2. **服务流程** — 6-step timeline: 新客户注册 → 电商下单 → 国内仓入库 → 整理合箱出库 → 国际运输状态记录 → 美国段取货确认
3. **核心优势** — 4 cards: 包裹入库可记录, 图片辅助确认, 合箱出库流程清晰, 状态查询减少沟通成本
4. **费用与时效提示** — amber info card: 费用/时效仅作参考，以实际打包和工作人员确认为准
5. **CTA** — 立即注册客户信息(/register), 查询包裹状态(/tracking)

Data: Static content, no backend dependency.

---

## 5.2 Services Index Page

Route: `/services`
File: `src/app/(public)/services/page.tsx`

Metadata:

- title: `服务介绍｜广骏国际快运`
- description: 了解广骏国际快运的中国到美国跨境物流信息服务...

Sections:

1. **Hero** — H1: "服务介绍"，副标题描述中国到美国跨境物流信息与转运协助
2. **中国→美国线路服务** — 文案说明 + 空运/海运 link cards
3. **基础服务包含** — 7-item icon grid: 咨询与线路建议, 国内仓入库记录, 包裹拍照, 拆箱与整理, 合箱出库, 物流状态记录, 异常协助 (注: 非"免费服务", 以实际订单和工作人员确认为准)
4. **费用参考** — 3 pricing cards (参考价/起): 空运普通¥70/kg起, 空运需确认¥80/kg起, 海运普通¥25/kg起 + amber disclaimer
5. **计费说明** — 实际重量 vs 体积重, 取较大值, 进位计算, 附计费示例 (2kg实际 vs 2.548kg体积重 → 按3kg)
6. **时效说明** — 空运/海运卡片 + blue info card: 时效均为参考, 不承接急单
7. **服务区域与交接方式** — 服务 Santa Clara、San Jose、Milpitas、Fremont 及湾区周边客户 + 本地递送或预约交接说明
8. **CTA** — 新客户注册(/register), 查询物流状态(/tracking), 查看合规说明(/compliance)

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
- Create modal with: optional domesticTrackingNo, customerCode, adminNote, images
- CustomerCodeInput shows fixed `GJ`; admin enters four digits, payload keeps full `GJxxxx`
- Images upload only after create response returns package id; no id means upload is blocked
- Empty domesticTrackingNo displays as `未填写`
- Missing customer displays as `未识别`
- Status filter only shows: 未识别 / 已入库 / 已合箱
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
Metadata: `src/app/(public)/register/layout.tsx` — title: `新客户注册｜广骏国际快运`

Layout:

- PC: left form card + right info sidebar (280px)
- Mobile: single column, form then info

Form fields:

- 区号 (default +86)
- 手机号 (required)
- 微信号 (optional)
- 国内退货地址 (optional, textarea, helper text)
- 备注 (optional, textarea, helper text)
- 隐私确认 checkbox (required, links to /privacy)

Info sidebar:

- "注册后会发生什么？" 3-step process (提交信息 → 工作人员审核 → 审核通过)
- Info notes: 客户编号用途、信息用途、审核通知

Success card:

- 注册信息已提交
- 客户编号 (large, bold, with copy button)
- 当前状态：待审核
- "客户编号不是登录密码，也不代表已开通登录账户"
- 返回首页 + 查看服务介绍 buttons

Error handling:

- 400: form validation error
- 409: duplicate registration prompt
- Network failure: shows requestId

Not included: User Portal login, SMS verification, payment

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
- If `createdCustomer` exists, show formal Customer card and allow Customer status update through `PATCH /admin/customers/:id`
- Registration status and formal Customer status are separate concepts

APIs:

- `GET /admin/customer-registrations/:id`
- `PATCH /admin/customer-registrations/:id`
- `POST /admin/customer-registrations/:id/approve`
- `POST /admin/customer-registrations/:id/reject`
- `PATCH /admin/customers/:id`
- `DELETE /admin/customer-registrations/:id?confirm=DELETE_HARD`

### 13.4 Updated Customer Pages

- `/admin/customers` and `/admin/customers/[id]` now include `domesticReturnAddress` field
- Create customer modal includes domesticReturnAddress
- Detail page edit form includes domesticReturnAddress
- Detail page hydrates from `GET /admin/customers/:id` and is safe to refresh directly
- `/admin/customers` reads normalized `response.items`
- The table displays customerCode, phone, wechatId, domestic return address summary, status, createdAt, and actions
- Customer list/detail do not depend on `displayName`

### 13.5 Admin Customer Shipments

Route: `/admin/customer-shipments`
File: `src/app/(admin)/admin/customer-shipments/page.tsx`

Features:

- List with search, status filter, pagination
- Status filter only shows: 已打包 / 已发货 / 已到达 / 待自提 / 已取货 / 异常
- Create modal accepts admin-facing customerCode and submits `customerCode` in payload
- CustomerCodeInput shows fixed `GJ`; admin enters four digits, payload keeps full `GJxxxx`
- Create modal includes `件数` number input, default 1, min 1
- List and mobile cards display quantity

Route: `/admin/customer-shipments/[id]`
File: `src/app/(admin)/admin/customer-shipments/[id]/page.tsx`

Features:

- Detail displays quantity
- Edit form allows quantity update
- Status updates submit only canonical simplified statuses

---

## 13.6 Privacy Policy Page

Route: `/privacy`
File: `src/app/(public)/privacy/page.tsx`
Metadata: title: `隐私政策｜广骏供应链服务`

Sections (7 cards):

1. **我们收集的信息** — 联系方式(区号/手机号/微信号), 客户编号, 国内退货地址, 国内快递单号, 包裹图片, 集运单信息, 交易记录, 注册申请信息, 设备和访问日志
2. **我们如何使用信息** — 客户联系, 包裹归属, 入库/出库记录, 物流状态查询, 异常处理, 系统安全
3. **Public 页面不会展示的信息** — blue highlight card: 手机号, 微信号, 国内退货地址, 客户姓名, 包裹图片, 交易记录, 管理员备注, 其他客户资料
4. **新客户注册说明** — 注册≠开通, 客户编号≠登录密码, 无 User Portal
5. **数据安全** — 前端不直接访问 DB, 后端 API 管理资料, 管理员需登录, HTTPS
6. **信息共享** — 不出售, 仅承运商和法律要求
7. **联系我们**

Not mentioned: 身份证, 银行卡, 人脸, 精准定位, 通讯录 (系统不使用)

---

## 13.6 Public Policy Pages

### /compliance 合规说明

File: `src/app/(public)/compliance/page.tsx`
Metadata: title: `合规说明｜广骏供应链服务`

Sections:

1. **服务定位** — 跨境物流信息与转运协助, 不构成法律意见
2. **普通品类** — green card: 衣物, 鞋帽, 家居, 饰品, 日用品
3. **需提前确认** — amber card: 带电, 液体/膏体, 化妆品, 食品, 药品, 品牌, 高价值, 易碎品
4. **暂不承接** — red card: 危险品, 受管制, 活体动物, 果蔬, 酒类烟草, 冷藏, 违禁物
5. **用户责任** — blue info card
6. **时效边界** — amber warning card

### /terms 服务条款

File: `src/app/(public)/terms/page.tsx`
Metadata: title: `服务条款｜广骏供应链服务`

Sections:

1. **页面用途** — 使用规则/费用确认/时效参考/异常处理/客户责任
2. **费用说明** — 参考价, 以实际打包和工作人员确认为准
3. **计费重量** — 实际重量 vs 体积重, 取较大值, 进位计算
4. **时效说明** — 参考, 不承接急单
5. **客户资料** — 确保信息真实准确可联系
6. **异常处理** — 及时联系, 提供可核验信息, 链接 /compensation
7. **取货与保管** — 按通知取货, 超期可能产生费用
8. **服务变更** — 线路/费用/时效可能调整

### /compensation 异常与赔付说明 (新增)

File: `src/app/(public)/compensation/page.tsx`
Metadata: title: `异常与赔付说明｜广骏供应链服务`

Sections:

1. **处理原则** — 根据入库记录/出库照片/承运商状态协助核查
2. **反馈时限** — 建议一周内, 提供照片/视频/订单号
3. **仓库阶段异常** — 出库前查找, 以实际记录和责任认定为准
4. **出库后运输阶段异常** — 结合承运商状态/批次记录/签收信息处理
5. **部分少件** — 提供开箱照片/视频/出库对比
6. **易碎品和特殊品类** — 运输风险更高, 责任需结合实际判断
7. **显示签收但未收到** — 结合派送记录/承运商调查处理
8. **不适用或限制赔付情形** — amber card: 7 项排除条件
9. **CTA** — 合规说明 + 服务条款

Not included: 具体金额赔付标准 (待业务确认后单独添加)

### /disclaimer 免责声明

File: `src/app/(public)/disclaimer/page.tsx`
Metadata: title: `免责声明｜广骏供应链服务`

Sections:

1. **页面信息** — 仅作服务说明和参考
2. **费用与承接范围** — 可能调整
3. **时效参考** — 不构成固定承诺
4. **物流状态查询** — 可能有延迟
5. **禁止与限制品类** — 不提供承接承诺, 链接 /compliance
6. **服务确认** — blue info card: 以实际订单记录及工作人员确认为准

Not used: "最终解释权归公司"

---

## 14. Public Layout & Navigation Conventions

### 14.1 Container Centering

All public page sections use `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` for consistent centering. The Tailwind CSS v4 `container` utility only sets `width: 100%` and does NOT auto-center, so we avoid using it directly. Inner content areas may further constrain width with `max-w-3xl`, `max-w-2xl`, etc.

### 14.2 Public Navbar

- Logo (left) links to `/` with `aria-label="返回首页"` — serves as the Home button
- **No "首页" tab** — Logo is the sole home link, avoiding redundancy
- Nav items (right): 服务, 查询, 批次更新, 新客户注册, 合规, 隐私, 管理员
- **"Admin" renamed to "管理员"** for consistent Chinese language
- Layout: `justify-between` — Logo on the left, nav links on the right
- Desktop: horizontal nav items
- Mobile: hamburger menu with same nav items (no 首页, uses 管理员)
- Sticky header preserved

### 14.3 Footer

- Uses same `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` container
- Four columns (PC): Brand, 服务, 说明, 管理
- Mobile: stacked layout
- 说明 column: 合规说明, 隐私政策, 服务条款, 异常与赔付说明, 免责声明
- No fake phone numbers — uses "请联系工作人员获取最新联系方式"
- 管理员入口 links to `/admin/login`

### 14.4 Public Pages Updated

All public pages use centered layout: /, /about, /services, /services/china-us-shipping, /services/air-freight, /services/sea-freight, /tracking, /batch-updates, /batch-updates/[batchNo], /register, /compliance, /privacy, /terms, /compensation, /disclaimer, /team.

---

## 15. Public Pages Metadata Summary

All public pages use the standardized `buildMetadata()` helper from `lib/seo.ts`:

| Path | Title | Description | Canonical |
|------|-------|-------------|-----------|
| `/` | 广骏国际快运｜看得见的跨境物流 | 广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务，支持入库记录、包裹拍照、合箱整理、物流状态查询与美国段取货状态管理。 | `/` |
| `/services` | 服务介绍｜广骏国际快运 | 了解广骏国际快运的中国到美国跨境物流信息服务，包括入库记录、包裹拍照、合箱出库、费用参考、计费说明和时效说明。 | `/services` |
| `/tracking` | 物流状态查询｜广骏国际快运 | 通过国内快递单号或集运单号查询低敏物流状态。公开查询仅展示状态信息，不展示手机号、微信号、图片或交易记录。 | `/tracking` |
| `/batch-updates` | 批次更新｜广骏国际快运 | 查看广骏国际快运公开发布的批次状态更新，了解已公开的低敏物流进度信息。 | `/batch-updates` |
| `/register` | 新客户注册｜广骏国际快运 | 填写新客户联系信息，提交后生成客户编号，工作人员审核通过后用于后续包裹归属。 | `/register` |
| `/faq` | 常见问题｜广骏国际快运 | 了解广骏国际快运的新客户注册、客户编号、包裹入库、计费规则、时效参考、品类限制和异常处理常见问题。 | `/faq` |
| `/about` | 关于我们｜广骏国际快运 | 了解广骏国际快运的品牌故事、服务理念与核心价值。 | `/about` |
| `/team` | 团队介绍｜广骏国际快运 | 了解广骏国际快运的服务团队与分工，包括国内仓储、海外仓管理和系统客服团队。 | `/team` |
| `/compliance` | 合规说明｜广骏供应链服务 | 了解广骏供应链服务的品类说明、用户责任、时效边界和暂不承接物品说明。 | `/compliance` |
| `/privacy` | 隐私政策｜广骏供应链服务 | 了解广骏供应链服务如何处理联系方式、客户编号、包裹记录、图片、交易记录和注册申请信息。 | `/privacy` |
| `/terms` | 服务条款｜广骏供应链服务 | 了解广骏供应链服务的费用说明、计费规则、时效说明、客户责任和异常处理规则。 | `/terms` |
| `/compensation` | 异常与赔付说明｜广骏供应链服务 | 了解包裹异常、少件、破损、延误和承运商异常情况下的处理原则与反馈要求。 | `/compensation` |
| `/disclaimer` | 免责声明｜广骏供应链服务 | 了解广骏供应链服务页面信息、费用、时效和状态查询的免责声明。 | `/disclaimer` |

**Notes:**

- All pages use `广骏国际快运` for public-facing titles and `广骏供应链服务` for legal/policy pages
- All pages have canonical URLs set via the metadata helper
- Admin pages (`/admin/*`) are set to `noindex, nofollow`
- Dynamic routes like `/batch-updates/[batchNo]` use `generateMetadata` for proper canonical generation

---

## 16. Deployment Pages Checklist

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
- [ ] API base URL is provided by `NEXT_PUBLIC_API_BASE_URL`
