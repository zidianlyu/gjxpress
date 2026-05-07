# Frontend SEO Strategy - GJXpress / 广骏供应链服务

## 1. Purpose

This document defines the SEO implementation strategy for the `frontend/` Next.js application.

The frontend has two SEO objectives:

1. Build trust and visibility for 广骏供应链服务 / 广骏国际快运 as a China-US cross-border logistics and package forwarding service.
2. Build organic traffic through useful recommendation and guide content for Chinese-speaking users in the United States.

---

## 2. SEO Principles

### 2.1 Content First

Search visibility should come from useful content, not just technical setup.

Priority content themes:

- 中美集运
- 跨境物流
- 中国寄美国
- 美国华人生活服务
- 包裹转运流程
- 空运与海运对比
- 国内仓入库确认
- 包裹拍照透明化

### 2.2 Avoid Thin Programmatic Pages

Do not generate large numbers of low-value city/category pages with copied text.

Every indexable page should have:

- Unique title
- Unique description
- Useful body content
- Internal links
- Clear user value

### 2.3 Chinese-Language SEO for US Users

Target audience:

```text
在美国生活的华人
需要从中国购买商品并寄到美国的用户
需要本地生活服务推荐的华人用户
```

Primary language:

```text
简体中文
```

Optional English terms can appear when useful:

```text
China-US shipping
package forwarding
air freight
sea freight
```

---

## 3. Technical SEO Infrastructure

### 3.1 Unified Site Configuration

All site configuration is centralized in `lib/site-config.ts`:

```typescript
export const siteConfig = {
  name: '广骏国际快运',
  legalName: '广骏供应链服务',
  englishName: 'GJXpress',
  slogan: '看得见的跨境物流',
  domain: 'gjxpress.net',
  url: 'https://gjxpress.net',
  description: '广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务...',
  locale: 'zh_CN',
  address: {
    // streetAddress: '完整街道地址', // 私人地址，不公开
    addressLocality: 'Santa Clara',
    addressRegion: 'CA',
    // postalCode: '邮编', // 私人地址，不公开
    addressCountry: 'US',
  },
}
```

### 3.2 Metadata Helper

Standardized metadata generation via `lib/seo.ts`:

```typescript
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: '页面标题｜广骏国际快运',
  description: '页面描述...',
  path: '/page-path',
  noIndex: false, // optional
  image: '/og-image.png', // optional
  type: 'website', // optional, defaults to 'website'
});
```

The helper automatically generates:
- `title` with site name suffix
- `description`
- `alternates.canonical`
- `openGraph.*` (title, description, url, siteName, locale, type, images)
- `twitter.*` (card, title, description, images)
- `robots` (when `noIndex: true`)

### 3.3 Canonical URLs

Every public page has a canonical URL set via the metadata helper. Route group names like `(public)` and `(admin)` are excluded from URLs.

### 3.4 Admin NoIndex

All admin routes are set to `noindex, nofollow` via `app/(admin)/layout.tsx`:
```typescript
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};
```

### 3.5 Sitemap Configuration

`app/sitemap.ts` includes only public pages:
- ✅ Includes: /, /services, /tracking, /register, /contact, /faq, /compliance, /privacy, /terms, /compensation, /disclaimer
- ❌ Excludes: /admin/*, /api/*, dynamic query pages like /tracking?query=xxx
- ❌ Excludes: /batch-updates because it now permanently redirects to /tracking

### 3.6 Robots Configuration

`app/robots.ts` rules:
```text
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://gjxpress.net/sitemap.xml
```

### 3.7 SEO Risk Boundaries

Content must avoid:
- 包税、保证送达、保证通关、100%安全
- 绝对承诺和保证
- 虚假电话或营业时间
- 未经验证的邮箱地址

---

## 4. Structured Data (JSON-LD)

### 4.1 Organization JSON-LD

Global Organization schema added to root layout:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "广骏国际快运",
  "alternateName": "GJXpress",
  "url": "https://gjxpress.net",
  "description": "广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务...",
  "address": {
    "@type": "PostalAddress",
    // "streetAddress": "完整街道地址", // 私人地址，不公开
    "addressLocality": "Santa Clara",
    "addressRegion": "CA",
    // "postalCode": "邮编", // 私人地址，不公开
    "addressCountry": "US"
  }
}
```

### 4.2 LocalBusiness JSON-LD

LocalBusiness schema for search visibility:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "广骏国际快运",
  "alternateName": "GJXpress",
  "url": "https://gjxpress.net",
  "description": "广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务...",
  "address": {
    "@type": "PostalAddress",
    // "streetAddress": "完整街道地址", // 私人地址，不公开
    "addressLocality": "Santa Clara",
    "addressRegion": "CA",
    // "postalCode": "邮编", // 私人地址，不公开
    "addressCountry": "US"
  },
  "areaServed": ["Santa Clara", "Bay Area", "United States", "China"],
  "knowsAbout": [
    "中国到美国跨境物流信息服务",
    "包裹入库记录",
    "合箱整理",
    "物流状态查询"
  ]
}
```

### 4.3 BreadcrumbList JSON-LD

All public pages include breadcrumb navigation:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "首页",
      "item": "https://gjxpress.net"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "页面名称",
      "item": "https://gjxpress.net/page-path"
    }
  ]
}
```

**Pages with breadcrumbs:**
- `/services` - 首页 > 服务介绍
- `/tracking` - 首页 > 查询订单
- `/contact` - 首页 > 联系我们
- `/register` - 首页 > 新客户注册
- `/compliance` - 首页 > 合规说明
- `/privacy` - 首页 > 隐私政策
- `/terms` - 首页 > 服务条款
- `/compensation` - 首页 > 异常与赔付说明
- `/disclaimer` - 首页 > 免责声明

### 4.4 FAQ JSON-LD (Implemented)

FAQPage schema now implemented and used on FAQ page and key service pages:

```typescript
buildFaqJsonLd([
  { question: "问题", answer: "答案" }
])
```

**Usage rules:**
- Only use for visible FAQ content on the page
- Do not generate for hidden or non-existent FAQ sections
- FAQ content must match exactly what users can see on the page
- Used on `/faq` page with all categories
- Used on `/services`, `/register`, `/compliance`, `/compensation` with selected FAQs

**FAQ Pages with JSON-LD:**
- `/faq` - All 20 FAQs across 8 categories
- `/services` - 5 selected FAQs about services and pricing
- `/register` - 4 selected FAQs about registration
- `/compliance` - 2 selected FAQs about compliance
- `/compensation` - 2 selected FAQs about compensation

### 4.5 Structured Data Implementation

**Files:**
- `components/seo/JsonLd.tsx` - JSON-LD component
- `lib/structured-data.ts` - Structured data helpers
- `app/layout.tsx` - Global Organization/LocalBusiness schemas
- Individual pages - Breadcrumb schemas

**Risk boundaries:**
- ❌ No `telephone` (no stable public phone)
- ❌ No `openingHours` (no confirmed hours)
- ❌ No `aggregateRating` (no real ratings)
- ❌ No `review` (no real reviews)
- ❌ No `priceRange` (not confirmed)
- ✅ All structured data matches visible page content
- ✅ Address matches siteConfig and page content

---

## 5. Visual SEO & Semantic Structure

### 5.1 Icons & Favicon

**Current Status:**
- ✅ Created `/public/icon.svg` - Simple blue square with package icon
- ✅ Updated `app/manifest.ts` to reference existing icon.svg
- ✅ Added icons metadata to `app/layout.tsx`
- ❌ No favicon.ico (using icon.svg as fallback)
- ❌ No apple-touch-icon.png (using icon.svg as fallback)

**Implementation:**
```typescript
// app/layout.tsx
icons: {
  icon: '/icon.svg',
  shortcut: '/icon.svg',
  apple: '/icon.svg',
}

// app/manifest.ts
icons: [
  {
    src: "/icon.svg",
    sizes: "any",
    type: "image/svg+xml",
  },
]
```

### 5.2 Open Graph & Twitter Images

**Current Status:**
- ✅ Static OG image exists: `/opengraph-image.png`
- ✅ Static Twitter image exists: `/twitter-image.png`
- ✅ Added proper image metadata to layout
- ✅ Fallback images in SEO helper for all pages

**Image Metadata:**
```typescript
// app/layout.tsx
openGraph: {
  images: [
    {
      url: '/opengraph-image.png',
      width: 1200,
      height: 630,
      alt: '广骏供应链服务 - 看得见的中美跨境物流与供应链服务',
    },
  ],
}

twitter: {
  card: "summary_large_image",
  images: [
    {
      url: '/twitter-image.png',
      width: 1200,
      height: 600,
      alt: '广骏供应链服务 - 看得见的中美跨境物流与供应链服务',
    },
  ],
}
```

### 5.3 Image Alt Text Guidelines

**Current Status:**
- ✅ Logo uses icon components (no alt needed)
- ✅ Navigation links have proper aria-label
- ✅ No missing alt attributes found
- ✅ Decorative icons use Lucide React components

**Guidelines:**
- Logo: Use icon components with aria-label on parent link
- Real images: Always provide descriptive alt text
- Decorative icons: Use Lucide React components or alt=""
- Avoid keyword stuffing in alt text

### 5.4 Heading Structure

**Current Status:**
- ✅ Each page has exactly one H1
- ✅ Proper H2/H3 hierarchy maintained
- ✅ No heading skips detected
- ✅ FAQ questions use H3 (appropriate)

**Structure Rules:**
- H1: Page title (one per page)
- H2: Main section titles
- H3: Subsections, card titles, FAQ questions
- No heading elements in navigation/footer
- Semantic heading hierarchy maintained

---

## 6. Indexability & Crawlability

### 6.1 Indexable Pages

**Public Content Pages (Indexable):**
- `/` - Homepage
- `/services` - Service introduction
- `/faq` - FAQ page
- `/compliance` - Compliance information
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/compensation` - Compensation policy
- `/disclaimer` - Disclaimer
- `/register` - Customer registration
- `/tracking` - Tracking tool (indexable, but query results not in sitemap)

**Non-Indexable Pages:**
- `/admin/*` - All admin pages (noindex)
- `/api/*` - API endpoints (disallow in robots.txt)

### 6.2 Tracking & Register Boundaries

**Tracking Page:**
- ✅ Page itself is indexable (`/tracking`)
- ❌ Query results not indexed (no `/tracking/[id]` pages)
- ❌ No phone numbers/addresses in URLs
- ✅ Tool page, not content page

**Register Page:**
- ✅ Page is indexable (`/register`)
- ❌ Success state not indexed (client-side only)
- ❌ No personal data in URLs
- ✅ Form submission handled via API

**Implementation:**
```typescript
// robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

// admin/layout.tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

### 6.3 Internal Linking Strategy

**RelatedLinks Component Usage:**
- Consistent internal linking across all public pages
- Natural anchor text (no keyword stuffing)
- Logical flow between related content
- Improved crawlability and user navigation

**Link Distribution:**
- Homepage → Services, Register, Tracking, Compliance
- Services → Register, Tracking, Compliance, Compensation, FAQ
- Register → Privacy, Services, Compliance, FAQ
- Compliance → Terms, Compensation, Register
- FAQ → Services, Register, Tracking, Compliance

**SEO Benefits:**
- Distributed page authority
- Improved crawl depth
- Reduced bounce rate
- Better user experience

### 6.4 Core Web Vitals Foundation

**Performance Optimizations:**
- Server Components reduce JavaScript bundle
- Minimal client-side JavaScript for public pages
- No image loading issues (icons only)
- Efficient font loading with Geist
- Responsive mobile layouts prevent CLS

**Mobile Experience:**
- Responsive grid layouts (`grid-cols-1 sm:grid-cols-2`)
- Touch-friendly button sizes
- No horizontal overflow
- Proper sticky header height
- Mobile-optimized form layouts

**Technical Implementation:**
- No external analytics scripts
- Optimized font subsets
- Proper image dimensions (where applicable)
- Efficient CSS with Tailwind

---

## 8. 地址隐私规则

### 8.1 地址隐私原则

**不公开私人地址：**
- 当前地址是私人 apartment，不在 public 网站展示
- 不在 SEO metadata 中包含完整地址
- 不在 JSON-LD structured data 中输出 PostalAddress
- 不在 Google Business Profile 中公开展示地址

**服务区域表达：**
- 使用 areaServed 替代完整地址
- 列出具体服务城市：Santa Clara、San Jose、Milpitas、Fremont、Sunnyvale、Cupertino、Bay Area
- 使用 "本地递送或预约交接" 描述交接方式

### 8.2 技术实现

**siteConfig 配置：**
```typescript
serviceAreas: [
  'Santa Clara',
  'San Jose',
  'Milpitas',
  'Fremont',
  'Sunnyvale',
  'Cupertino',
  'Bay Area'
],
publicLocationSummary: '服务 Santa Clara、San Jose、Milpitas、Fremont 及湾区周边客户。',
handoffSummary: '支持本地上门递送或预约交接，具体安排由工作人员确认。'
```

**Structured Data：**
- Organization JSON-LD 使用 areaServed
- LocalBusiness JSON-LD 移除 PostalAddress
- 不输出 streetAddress、postalCode 等字段

**页面文案：**
- 服务页：服务区域与交接方式
- FAQ：服务区域相关问题
- 条款页：递送与保管
- Footer：显示服务区域列表

### 8.3 Google Business Profile

**设置要求：**
- 关闭 "Show business address to customers"
- 设置 Service areas 为湾区城市
- 描述文案与网站保持一致
- 不承诺固定营业时间

详细设置请参考：`docs/google-business-profile.md`

---

## 9. Domain and URL Strategy

### 3.1 Primary Domain

```text
https://gjxpress.net
```

### 3.2 Preferred Canonical Domain

Recommended canonical domain:

```text
https://www.gjxpress.net
```

or:

```text
https://gjxpress.net
```

Pick one and redirect the other to it through Vercel domain settings.

### 3.3 URL Rules

Use lowercase, hyphen-separated English slugs for stable URLs:

```text
/services/china-us-shipping
/services/air-freight
/services/sea-freight
/recommendations/los-angeles-chinese-supermarket-guide
/cities/los-angeles
/categories/chinese-supermarket
/guides/how-package-forwarding-works
```

Avoid Chinese characters in URLs for the first version because English slugs are easier to share, debug, and manage.

---

## 4. Page Types and SEO Intent

## 4.1 Home Page

Route:

```text
/
```

SEO goal:

- Brand trust
- Service discovery

Implemented metadata:

```text
Title: 广骏国际快运｜看得见的跨境物流
Description: 广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务，支持入库记录、包裹拍照、合箱整理、物流状态查询与美国段取货状态管理。
```

---

## 4.1b Services Index Page

Route:

```text
/services
```

SEO goal:

- Service discovery and pricing reference

Implemented metadata:

```text
Title: 服务介绍｜广骏国际快运
Description: 了解广骏国际快运的中国到美国跨境物流信息服务，包括入库记录、包裹拍照、合箱出库、费用参考、计费说明和时效说明。
```

---

## 4.1c Register Page

Route: `/register`

Implemented metadata:

```text
Title: 新客户注册｜广骏国际快运
Description: 填写新客户联系信息，提交后生成客户编号，工作人员审核通过后用于后续包裹归属。
```

---

## 4.1c-2 Tracking Page

Route: `/tracking`

Implemented metadata:

```text
Title: 查询订单与批次更新｜广骏国际快运
Description: 通过客户编号或物流信息查询订单状态，并查看广骏国际快运中国到美国线路的批次更新说明。
```

---

## 4.1c-3 Batch Updates Redirect

Route: `/batch-updates`

Implementation:

```text
Permanent redirect to /tracking.
No canonical, sitemap entry, or independent content page.
```

---

## 4.1c-4 About Page

Route: `/about`

Implemented metadata:

```text
Title: 关于我们｜广骏国际快运
Description: 了解广骏国际快运的品牌故事、服务理念与核心价值。
```

---

## 4.1c-5 Team Page

Route: `/team`

Implemented metadata:

```text
Title: 团队介绍｜广骏国际快运
Description: 了解广骏国际快运的服务团队与分工，包括国内仓储、海外仓管理和系统客服团队。
```

---

## 4.1d Privacy Policy Page

Route: `/privacy`

Implemented metadata:

```text
Title: 隐私政策｜广骏国际快运
Description: 了解广骏国际快运如何处理联系方式、客户编号、包裹记录、图片、交易记录和注册申请信息。
```

---

## 4.1e Compliance Page

Route: `/compliance`

Implemented metadata:

```text
Title: 合规说明｜广骏国际快运
Description: 了解广骏国际快运的品类说明、用户责任、时效边界和暂不承接物品说明。
```

---

## 4.1f Terms Page

Route: `/terms`

Implemented metadata:

```text
Title: 服务条款｜广骏国际快运
Description: 了解广骏国际快运的费用说明、计费规则、时效说明、客户责任和异常处理规则。
```

---

## 4.1g Compensation Page

Route: `/compensation`

Implemented metadata:

```text
Title: 异常与赔付说明｜广骏国际快运
Description: 了解包裹异常、少件、破损、延误和承运商异常情况下的处理原则与反馈要求。
```

---

## 4.1h Disclaimer Page

Route: `/disclaimer`

Implemented metadata:

```text
Title: 免责声明｜广骏国际快运
Description: 了解广骏国际快运页面信息、费用、时效和状态查询的免责声明。
```

---

## 4.2 China-US Shipping Landing Page

Route:

```text
/services/china-us-shipping
```

SEO goal:

- Rank for China-US shipping / 中美物流 / 中国寄美国 related searches.

Suggested metadata:

```text
Title: 中美跨境物流服务｜广骏国际快运
Description: 了解广骏国际快运的中美跨境物流流程：国内仓收货、入库拍照、合箱整理、空运/海运出库与物流状态查询。
```

Content outline:

```text
H1: 中美跨境物流服务
H2: 适合哪些用户
H2: 服务流程
H2: 空运和海运如何选择
H2: 为什么入库拍照更透明
H2: 常见问题
```

---

## 4.3 Air Freight Page

Route:

```text
/services/air-freight
```

SEO goal:

- Explain air freight service.

Suggested metadata:

```text
Title: 空运服务｜广骏国际快运
Description: 了解广骏国际快运的中美空运服务：时效相对更快，支持入库记录、包裹拍照和物流状态查询。
```

---

## 4.4 Sea Freight Page

Route:

```text
/services/sea-freight
```

SEO goal:

- Explain sea freight service.

Suggested metadata:

```text
Title: 海运服务｜广骏国际快运
Description: 了解广骏国际快运的中美海运服务：适合大件重货，支持合箱出库，入库拍照记录。
```

---

## 4.5 How It Works Page

Route:

```text
/how-it-works
```

SEO goal:

- Explain workflow and reduce customer confusion.

Suggested metadata:

```text
Title: 如何使用广骏供应链服务 | 包裹入库与发货流程
Description: 了解如何复制国内仓地址、在电商平台下单、确认入库照片并查看中美物流状态。
```

---

## 4.6 Recommendation Pages

Routes:

```text
/recommendations
/recommendations/[slug]
/cities/[city]
/categories/[category]
```

SEO goal:

- Build useful local content for Chinese-speaking US users.
- Attract long-tail traffic.

Recommended content categories:

```text
华人超市
本地生活服务
餐厅推荐
搬家/仓储
包裹服务
留学生生活
华人社区资源
```

Each recommendation detail page should include:

- Unique H1
- City/category
- Summary
- Why recommended
- Practical tips
- Related links
- Last updated date

---

## 5. Next.js Metadata Implementation

Use Next.js App Router metadata APIs.

### 5.1 Global Metadata

File:

```text
src/app/layout.tsx
```

Example:

```ts
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gjxpress.net'),
  title: {
    default: '广骏供应链服务 | 看得见的跨境物流',
    template: '%s | 广骏供应链服务',
  },
  description: '广骏供应链服务提供中美跨境供应链与物流信息服务，支持入库拍照、包裹确认、发货管理与物流查询。',
  openGraph: {
    type: 'website',
    siteName: '广骏供应链服务',
    locale: 'zh_CN',
  },
};
```

### 5.2 Dynamic Metadata

For recommendation detail pages:

```text
src/app/recommendations/[slug]/page.tsx
```

Implement:

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const item = await getRecommendationBySlug(params.slug);

  return {
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.summary,
    alternates: {
      canonical: `/recommendations/${item.slug}`,
    },
    openGraph: {
      title: item.title,
      description: item.summary,
      url: `/recommendations/${item.slug}`,
      images: item.imageUrl ? [item.imageUrl] : undefined,
    },
  };
}
```

---

## 6. Sitemap and Robots

### 6.1 Sitemap

Create:

```text
src/app/sitemap.ts
```

Should include:

- Home
- Services pages
- Guide pages
- Recommendation pages
- City pages
- Category pages

Do not include:

- `/admin/*`
- Login pages
- Error pages
- Draft/unpublished recommendation pages

Example:

```ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gjxpress.net';

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/services/china-us-shipping`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];
}
```

### 6.2 Robots

Create:

```text
src/app/robots.ts
```

Example:

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gjxpress.net';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 7. Structured Data

### 7.1 Organization JSON-LD

Add to home page or root layout:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "广骏供应链服务",
  "alternateName": "广骏国际快运",
  "url": "https://gjxpress.net"
}
```

### 7.2 Local Business / Service JSON-LD

For service pages, use conservative structured data.

Example fields:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "中美跨境物流信息服务",
  "provider": {
    "@type": "Organization",
    "name": "广骏供应链服务"
  },
  "areaServed": ["United States", "China"]
}
```

### 7.3 Recommendation Detail JSON-LD

If recommendation pages describe local businesses/resources, use appropriate schema only when data is accurate.

Do not fake ratings, reviews, addresses, or business claims.

---

## 8. Internal Linking Strategy

Each page should link to related pages.

Examples:

```text
Home -> Services -> China-US Shipping -> How It Works
Home -> Recommendations -> City pages -> Detail pages
Air freight -> Pricing/weight guide
Sea freight -> Package consolidation guide
Recommendation detail -> related city/category pages
```

Add breadcrumb UI for:

- Recommendation detail pages
- City pages
- Category pages
- Guide pages

---

## 9. Content Quality Guidelines

### 9.1 Recommended Article Structure

For guides:

```text
H1: Clear topic
Intro paragraph
H2: Who this is for
H2: Step-by-step explanation
H2: Common mistakes
H2: FAQ
CTA section
```

### 9.2 Recommendation Detail Structure

```text
H1: Recommendation title
Summary
City/category/tags
Why it is useful
Practical tips
Related recommendations
Last updated
```

### 9.3 Avoid

- Keyword stuffing
- Duplicate city pages with only city name changed
- Fake reviews
- Fake prices
- Claims about customs/tax avoidance
- Overpromising delivery time

---

## 10. Performance Requirements

Target:

```text
LCP < 2.5s
CLS < 0.1
INP good range
```

Implementation guidance:

- Use Next.js Image component for local/public images when possible.
- Compress large images before upload.
- Prefer server components for public pages.
- Avoid heavy client JavaScript on SEO pages.
- Lazy load non-critical sections.

---

## 11. Indexing and Search Console

After deployment:

1. Verify `gjxpress.net` in Google Search Console.
2. Submit `https://gjxpress.net/sitemap.xml`.
3. Request indexing for `/`, `/services`, `/tracking`, `/register`, `/contact`, `/faq`, `/compliance`, `/privacy`, `/terms`, `/compensation`, and `/disclaimer`.
4. Do not request indexing for `/batch-updates`; verify it permanently redirects to `/tracking`.
5. Check indexed pages.
6. Monitor queries and impressions.
7. Fix duplicate title/description warnings.

---

## 12. SEO MVP Checklist

Before launch:

- [ ] Unique metadata for home page
- [ ] Unique metadata for service pages
- [ ] `sitemap.ts` implemented
- [ ] `robots.ts` implemented
- [ ] `/admin` disallowed in robots
- [ ] All public pages have H1
- [ ] All images have alt text
- [ ] No sensitive terms in public content
- [ ] Canonical domain configured
- [ ] Internal links added
- [ ] Contact CTA available
- [ ] Home page includes a prominent contact highlight near the hero
- [ ] Every indexable public page shows visible contact information through ContactStrip/Footer
- [ ] `/contact` is included in sitemap
- [ ] Contact page has title, description, canonical, and breadcrumb JSON-LD
- [ ] Organization / LocalBusiness JSON-LD uses public contactPoint telephone values and does not output private address fields
- [ ] Public nav merges 查询 and 批次更新 into 查询订单 at `/tracking`
- [ ] `/batch-updates` is absent from sitemap/nav/footer and permanently redirects to `/tracking`
- [ ] 404 page created
