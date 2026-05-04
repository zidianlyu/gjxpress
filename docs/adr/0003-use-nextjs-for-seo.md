# ADR 0003: Use Next.js and Vercel for SEO Website and Web Frontend

## Status

Accepted

## Date

2026-05-04

## Decision

Use **Next.js** as the web frontend framework and deploy the public web frontend to **Vercel**.

The `frontend/` application will serve:

1. Public SEO pages.
2. U.S. Chinese community recommendation pages.
3. Landing pages for 广骏供应链服务 / GJXpress.
4. Admin UI in the early stage, either under `/admin` or through `admin.gjxpress.net`.

The backend API remains separate and is served from:

```text
https://api.gjxpress.net
```

The web frontend should not directly access Supabase service-role credentials.

## Context

The product has two frontend needs:

1. A **WeChat Mini Program** for logistics customers to view orders, packages, inbound photos, and shipment status.
2. A **public web frontend** for SEO and customer acquisition, including local recommendations for Chinese users in the United States.

A normal Vite single-page app is sufficient for admin-only tools but is not ideal for public SEO pages. The recommendation system and landing pages need crawlable HTML, metadata, Open Graph support, fast page loads, and future structured data.

Next.js provides static generation, server-side rendering, metadata handling, routing, and easy Vercel deployment. This makes it a better fit for SEO and public content than a pure SPA.

## Decision Drivers

- SEO requirements for public pages.
- Need for static and server-rendered pages.
- Need for metadata, OG images, sitemap, and robots handling.
- Strong TypeScript support.
- Strong ecosystem and Vercel deployment workflow.
- Ability to keep admin UI in the same frontend initially.
- Easy preview deployments for iteration.
- Clear separation from WeChat Mini Program.

## Chosen Architecture

Frontend framework:

```text
Next.js App Router
```

Deployment:

```text
Vercel
```

Domains:

```text
gjxpress.net          → Vercel
www.gjxpress.net      → Vercel
admin.gjxpress.net    → Vercel or /admin route
api.gjxpress.net      → AWS EC2 NestJS backend
```

Data access:

```text
Next.js frontend
→ api.gjxpress.net
→ NestJS backend
→ Supabase Postgres / Storage
```

No frontend should use Supabase service-role keys.

## Initial Frontend Scope

### Public Site

Recommended routes:

```text
/
/services
/services/china-us-shipping
/services/air-freight
/services/sea-freight
/guides
/guides/how-to-ship-from-taobao-to-us
/recommendations
/recommendations/[slug]
/about
/contact
/privacy
/terms
```

### Recommendation System

Initial recommendation pages may include:

```text
/recommendations
/recommendations/[city]
/recommendations/[city]/[category]
/recommendations/[slug]
```

Example categories:

```text
Chinese restaurants
local services
student resources
shipping tips
shopping guides
```

### Admin UI

Early-stage admin UI can live under:

```text
/admin
```

or use:

```text
admin.gjxpress.net
```

Admin pages must be protected and should not be indexed.

Required no-index behavior for admin routes:

```text
robots: noindex, nofollow
```

## SEO Requirements

Public pages should include:

- Page-specific title.
- Page-specific description.
- Canonical URL.
- Open Graph metadata.
- Twitter card metadata if useful.
- Structured data where applicable.
- Sitemap generation.
- Robots.txt.
- Clean URL slugs.
- Server-rendered or statically generated content.

Recommended title pattern:

```text
{Page Title} | 广骏供应链服务
```

Recommended public brand language:

```text
广骏供应链服务
看得见的跨境物流
提供跨境供应链与物流信息服务
```

Avoid high-risk wording:

```text
代购
清关
免税
避税
灰关
走私
包税
```

## API Usage Rules

The frontend should call backend APIs through `api.gjxpress.net`.

Examples:

```text
GET /public/recommendations
GET /public/recommendations/:slug
POST /admin/login
GET /admin/orders
PATCH /admin/orders/:id/status
```

The frontend should not:

- Directly query Supabase with service-role keys.
- Directly mutate logistics operational data without backend validation.
- Store sensitive backend secrets in Vercel client-side environment variables.

Use only safe public environment variables with `NEXT_PUBLIC_` prefix.

## Alternatives Considered

### Vite + React SPA

Pros:

- Fast development.
- Excellent for internal admin dashboards.
- Simple build pipeline.

Cons:

- Not ideal for SEO-heavy public pages unless additional SSR/prerendering is added.
- More manual metadata and sitemap work.
- Public pages may rely too much on client-side rendering.

Rejected for public frontend. It may still be acceptable for a future standalone admin-only app.

### Astro

Pros:

- Excellent static-site and content performance.
- Very strong for content-heavy sites.

Cons:

- Less aligned with React full-stack/admin needs.
- Team already benefits from TypeScript + Next.js ecosystem.

Rejected for now.

### WordPress

Pros:

- Easy content management.
- Mature SEO plugins.

Cons:

- Another system to operate.
- Less aligned with app/admin/data architecture.
- Not ideal for custom operational/admin workflows.

Rejected.

### Host Next.js on EC2

Pros:

- One cloud host for frontend and backend.
- Full control.

Cons:

- More DevOps work.
- Less convenient preview deployments.
- More effort for caching and global delivery.

Rejected. Vercel is better for the public frontend at this stage.

## Consequences

### Positive

- Better fit for SEO than a pure SPA.
- Easy Vercel deployment and preview URLs.
- Strong TypeScript and React ecosystem.
- Good future flexibility for content, recommendations, and admin pages.
- Clean separation between public frontend and backend API.

### Negative

- Adds Vercel as another platform.
- Requires CORS handling between `gjxpress.net` and `api.gjxpress.net`.
- Need careful environment variable handling.
- If admin UI grows large, it may eventually need to be split from public site.

## CORS Requirements

Backend must allow frontend origins:

```text
https://gjxpress.net
https://www.gjxpress.net
https://admin.gjxpress.net
```

Development origins may include:

```text
http://localhost:3000
http://localhost:3001
```

## Deployment Notes

Vercel should host:

```text
gjxpress.net
www.gjxpress.net
admin.gjxpress.net
```

AWS EC2 should host:

```text
api.gjxpress.net
```

Do not deploy the public frontend to EC2 unless there is a strong operational reason.

## Related Documents

- `docs/prd.md`
- `docs/architecture.md`
- `docs/api_contract.md`
- `frontend/docs/prd.md`
- `frontend/docs/seo.md`

## References

- Next.js Documentation: https://nextjs.org/docs
- Next.js SEO Rendering Strategies: https://nextjs.org/learn/seo/rendering-strategies
- Next.js Metadata API: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- Vercel Next.js Deployment Documentation: https://vercel.com/docs/frameworks/full-stack/nextjs
