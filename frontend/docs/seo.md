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

## 3. Domain and URL Strategy

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
Title: 物流状态查询｜广骏国际快运
Description: 输入集运单号查询包裹当前物流状态，结果仅显示物流信息，不包含个人隐私信息。
```

---

## 4.1c-3 Batch Updates Page

Route: `/batch-updates`

Implemented metadata:

```text
Title: 批次更新｜广骏国际快运
Description: 查看公开的国际批次运输状态更新，了解批次运输进度。
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
3. Check indexed pages.
4. Monitor queries and impressions.
5. Fix duplicate title/description warnings.

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
- [ ] 404 page created
