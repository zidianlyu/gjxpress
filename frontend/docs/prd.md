# Frontend PRD - GJXpress / 广骏供应链服务

## 1. Document Purpose

This document defines the product requirements for the `frontend/` application in the GJXpress monorepo.

The frontend is a **Next.js web application deployed on Vercel**. It serves two major purposes:

1. Public-facing website with SEO pages for users in the United States, especially Chinese-speaking users who need China-US logistics, shipping, package forwarding, and local recommendation content.
2. Web-based Admin portal for internal operators to manage logistics operations through the NestJS backend API.

The frontend must not contain backend business logic, must not access Supabase directly, and must not expose any WeChat Mini Program secrets or admin-only backend secrets.

---

## 2. Product Name and Branding

### 2.1 Public Brand

- Chinese product/service name: 广骏供应链服务
- Brand display name: 广骏国际快运
- English/internal system name: GJXpress
- Slogan: 看得见的跨境物流

### 2.2 Domain Plan

- Public website: `https://gjxpress.net`
- Public website alternative: `https://www.gjxpress.net`
- Admin portal: `https://admin.gjxpress.net` or `https://gjxpress.net/admin`
- Backend API: configured by `NEXT_PUBLIC_API_BASE_URL`

Recommended initial implementation:

```text
frontend deployed to Vercel
backend deployed to AWS EC2
frontend calls backend through `NEXT_PUBLIC_API_BASE_URL`
```

---

## 3. Scope

### 3.1 In Scope

The frontend app should include:

1. Public marketing pages
   - Home page
   - Service overview page
   - China-US logistics landing page
   - Air freight / sea freight explanation pages
   - About / contact pages

2. Public recommendation pages
   - Local Chinese community recommendation list
   - Recommendation detail page
   - City/category landing pages
   - SEO-friendly content pages

3. Public guide/content pages
   - How to use the service
   - How package forwarding works
   - Warehouse address guide
   - Shipping cost explanation
   - Prohibited/restricted item guide

4. Admin portal
   - Login page
   - Dashboard
   - Orders list
   - Order detail
   - Package inbound management
   - Shipment management
   - Exception management
   - User lookup
   - Admin action logs

5. Shared UI system
   - Header
   - Footer
   - Layouts
   - Buttons
   - Cards
   - Status badges
   - Tables
   - Forms
   - Empty/error/loading states

6. Integration with backend API
   - Public APIs for recommendation content
   - Admin APIs with JWT authentication
   - Error handling
   - API client wrapper

---

### 3.2 Out of Scope

The frontend must not implement:

- WeChat Mini Program UI
- WeChat login flow for Mini Program users
- WeChat Pay
- Alipay
- Direct Supabase database calls from browser
- Direct Supabase Storage service-role calls from browser
- Backend business rules
- Package status mutation without authenticated admin API
- Customer package tracking workflow that belongs in `miniprogram/`

---

## 4. User Types

### 4.1 Public Visitor

A public visitor can:

- Read service information
- Browse China-US shipping guides
- Browse local recommendation pages
- Learn how to use the logistics service
- Contact the company
- Learn that actual order tracking is handled through WeChat Mini Program

### 4.2 Potential Customer

A potential customer can:

- Understand shipping service model
- Learn service advantages
- Learn how warehouse address / package forwarding works
- Find call-to-action to scan/contact through WeChat
- Browse trusted content and recommendations

### 4.3 Admin User

An admin user can:

- Log into the admin portal
- View dashboard metrics
- Manage orders
- Manage packages
- Upload/inspect package records through backend APIs
- Update payment status
- Create shipment records
- Resolve exceptions
- Review admin action logs

Admin authorization is controlled by the backend. The frontend only stores and sends the admin access token.

---

## 5. Product Goals

### 5.1 Public Website Goals

- Establish trust for 广骏供应链服务 / 广骏国际快运.
- Explain the China-US cross-border logistics workflow clearly.
- Convert public visitors into WeChat Mini Program or customer-service users.
- Build SEO presence for Chinese-speaking users in the United States.
- Provide useful local recommendations to attract organic traffic.

### 5.2 Admin Portal Goals

- Give operators a faster way to manage logistics operations.
- Reduce manual spreadsheet usage.
- Keep all operational actions logged through backend APIs.
- Provide visibility into inbound packages, pending confirmations, payments, exceptions, and shipments.

---

## 6. High-Level Architecture

```text
Browser visitor
  -> gjxpress.net / www.gjxpress.net
  -> Vercel Next.js frontend

Admin user
  -> admin.gjxpress.net or gjxpress.net/admin
  -> Vercel Next.js frontend
  -> api.gjxpress.net
  -> NestJS backend
  -> Supabase Postgres + Storage

WeChat Mini Program user
  -> miniprogram/
  -> api.gjxpress.net
  -> NestJS backend
```

The frontend and the mini program are separate clients. The frontend should not assume it can access mini program runtime APIs.

---

## 7. Technical Requirements

### 7.1 Framework

Use:

```text
Next.js App Router
TypeScript
Tailwind CSS
ESLint
Vercel deployment
```

Recommended project folder:

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/
│   ├── styles/
│   └── types/
├── public/
├── docs/
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

### 7.2 API Boundary

All backend requests should go through:

```text
NEXT_PUBLIC_API_BASE_URL=<backend-origin>
```

Frontend should implement a shared API wrapper:

```text
src/lib/api/client.ts
src/lib/api/public.ts
src/lib/api/admin.ts
```

No service role key or backend secret should appear in the frontend codebase.

### 7.3 Environment Variables

Required variables:

```env
NEXT_PUBLIC_SITE_URL=https://gjxpress.net
NEXT_PUBLIC_API_BASE_URL=<backend-origin>
NEXT_PUBLIC_BRAND_NAME=广骏供应链服务
NEXT_PUBLIC_BRAND_DISPLAY_NAME=广骏国际快运
```

Optional variables:

```env
NEXT_PUBLIC_WECHAT_CONTACT_QR_URL=
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_DEFAULT_CITY=Los Angeles
```

Admin-only or backend-only secrets must not be prefixed with `NEXT_PUBLIC_`.

---

## 8. Functional Requirements: Public Website

### 8.1 Home Page

Route:

```text
/
```

Purpose:

- Introduce the brand.
- Explain the core value proposition.
- Direct users to service guide, recommendations, and contact/WeChat.

Must include:

- Hero section
- Slogan: 看得见的跨境物流
- Value points:
  - 入库拍照
  - 全程透明
  - 空运/海运效率提升
  - 更高性价比
- CTA buttons:
  - 查看服务流程
  - 联系客服
  - 浏览本地推荐
- How it works section
- Trust section
- FAQ section

---

### 8.2 Service Overview Page

Route:

```text
/services
```

Purpose:

- Explain the overall service model.

Must include:

- Domestic warehouse inbound process
- Package photo confirmation
- Payment status explanation
- International shipment process
- Tracking and confirmation

Avoid sensitive wording:

- Do not use: 代购, 灰关, 免税, 避税, 走私, 包税.
- Prefer: 跨境供应链与物流信息服务, 仓储入库, 包裹确认, 发货管理, 物流查询.

---

### 8.3 China-US Shipping Landing Page

Route:

```text
/services/china-us-shipping
```

Purpose:

- SEO landing page for China-US shipping.

Must include:

- Who this service is for
- Typical shipping workflow
- Air freight vs sea freight comparison
- How package consolidation works
- FAQ
- CTA to WeChat Mini Program/customer service

---

### 8.4 Air Freight Page

Route:

```text
/services/air-freight
```

Purpose:

- Explain air freight service.

Must include:

- Best for urgent/smaller packages
- Estimated timeframe placeholder
- Chargeable weight explanation
- Photo confirmation flow
- CTA

---

### 8.5 Sea Freight Page

Route:

```text
/services/sea-freight
```

Purpose:

- Explain sea freight service.

Must include:

- Best for larger/heavier packages
- Cost-effective positioning
- Estimated timeframe placeholder
- Package consolidation explanation
- CTA

---

### 8.6 How It Works Page

Route:

```text
/how-it-works
```

Must include numbered steps:

```text
1. 复制国内仓地址
2. 在淘宝/京东等平台下单
3. 包裹到达国内仓
4. 仓库拍照/称重/入库
5. 用户在微信小程序确认
6. 管理员安排发货
7. 用户查看物流状态
```

---

### 8.7 Contact Page

Route:

```text
/contact
```

Must include:

- Contact methods
- WeChat QR placeholder
- Business hours placeholder
- Contact form placeholder or link
- Service area note

Do not collect sensitive user data unless backend form API exists.

---

## 9. Functional Requirements: Recommendation System

The recommendation system is a public SEO-oriented feature for Chinese-speaking users in the United States.

### 9.1 Recommendation List

Route:

```text
/recommendations
```

Must support:

- Category filter
- City filter
- Search input
- Pagination or load more
- Recommendation cards

Card fields:

```text
name
title
city
category
summary
tags
rating/score optional
image optional
slug
```

### 9.2 Recommendation Detail

Route:

```text
/recommendations/[slug]
```

Must include:

- Title
- City/category
- Description
- Useful tips
- Contact or external link if approved
- Related recommendations
- JSON-LD structured data if appropriate

### 9.3 City Landing Pages

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

Must include:

- City intro
- Recommended local resources
- Logistics-related guide section
- Internal links to recommendation details

### 9.4 Category Landing Pages

Route:

```text
/categories/[category]
```

Examples:

```text
/categories/chinese-supermarket
/categories/package-forwarding
/categories/local-services
/categories/restaurants
```

---

## 10. Functional Requirements: Admin Portal

The Admin portal can be implemented under:

```text
/admin
```

or as subdomain:

```text
admin.gjxpress.net
```

Initial implementation can use route group:

```text
src/app/(admin)/admin/...
```

### 10.1 Admin Login

Route:

```text
/admin/login
```

Requirements:

- Username/password form
- Calls backend `POST /admin/auth/login`
- Store returned access token in memory or localStorage initially
- Redirect to `/admin/dashboard`
- Show error messages for invalid login

Security note:

- Backend owns authentication and authorization.
- Frontend should not hardcode admin accounts.

### 10.2 Admin Dashboard

Route:

```text
/admin/dashboard
```

Metrics:

- Today inbound packages
- Pending user confirmations
- Pending payments
- Ready to ship
- Shipped today
- Open exceptions

### 10.3 Orders List

Route:

```text
/admin/orders
```

Features:

- Table view
- Search by order number, user code, package number
- Filter by order status
- Filter by payment status
- Date range filter
- Link to order detail

### 10.4 Order Detail

Route:

```text
/admin/orders/[id]
```

Features:

- Order summary
- User info
- Packages table
- Payment status update
- Shipment section
- Admin action log summary

### 10.5 Package Inbound

Routes:

```text
/admin/packages
/admin/packages/inbound
/admin/packages/[id]
```

Features:

- Inbound form
- Upload photo flow through backend upload URL
- Weight/dimensions input
- Package status update
- Package image gallery

### 10.6 Shipment Management

Routes:

```text
/admin/shipments
/admin/shipments/new
/admin/shipments/[id]
```

Features:

- Create shipment
- Provider input: UPS/DHL/EMS/OTHER
- Tracking number
- Shipped time
- Estimated arrival
- Status update

### 10.7 Exception Management

Routes:

```text
/admin/exceptions
/admin/exceptions/[id]
```

Features:

- View open exceptions
- Assign status: OPEN / PROCESSING / RESOLVED
- Add resolution note
- Link to order/package

### 10.8 Admin Logs

Route:

```text
/admin/logs
```

Features:

- List admin action logs
- Filter by admin/user/action/date
- View before/after state

---

## 11. Data Fetching Requirements

### 11.1 Public Pages

Public content should prefer server rendering or static generation where possible:

- Marketing pages can be static.
- Recommendation list/detail can be fetched from backend with caching/revalidation.
- Avoid client-only rendering for SEO pages.

### 11.2 Admin Pages

Admin pages can be client-heavy:

- Use client components for tables/forms.
- Use API client with Bearer token.
- Use loading/error states.
- Protect admin routes by checking token presence and backend validation.

---

## 12. UI/UX Requirements

### 12.1 Visual Style

The frontend should feel:

- Clean
- Trustworthy
- Professional
- Chinese-language friendly
- Logistics/SaaS style

Recommended colors:

```text
Primary: deep blue or teal
Accent: warm gold/yellow for logistics/status
Neutral: slate/gray
Success: green
Warning: amber
Error: red
```

### 12.2 Language

Primary language:

```text
Simplified Chinese
```

English may be used in admin/system labels only when helpful.

### 12.3 Accessibility

- Use semantic HTML.
- Use meaningful button labels.
- Ensure keyboard navigation for admin forms.
- Add `alt` text for images.
- Maintain sufficient contrast.

---

## 13. Content and Compliance Guidelines

Public pages should avoid sensitive or risky words that may create compliance or audit risk.

Avoid:

```text
代购
清关
免税
避税
灰关
走私
包税
```

Prefer:

```text
跨境供应链与物流信息服务
仓储入库
包裹确认
发货管理
物流查询
中美集运
跨境物流
```

---

## 14. Success Metrics

### 14.1 Public Website Metrics

- Organic traffic
- Landing page conversion to contact/WeChat
- Recommendation page views
- Guide page views
- Search impressions
- Click-through rate

### 14.2 Admin Metrics

- Time to create inbound package
- Number of packages processed per day
- Number of open exceptions
- Number of orders ready to ship
- Payment status processing time

---

## 15. MVP Priority

### Phase 1: Public Shell + SEO Foundation

- Create Next.js app
- Home page
- Services page
- How it works page
- Contact page
- SEO metadata
- Sitemap/robots

### Phase 2: Admin MVP

- Admin login
- Dashboard
- Orders table
- Order detail
- Package inbound form

### Phase 3: Recommendation MVP

- Recommendations list
- Recommendation detail
- City/category pages
- Basic JSON-LD

### Phase 4: Optimization

- Content expansion
- Vercel Analytics
- Better admin tables
- Image optimization
- More structured data
