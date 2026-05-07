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
│   │   │   ├── batch-updates/
│   │   │   ├── register/
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
  address: {
    addressRegion: "CA",
    postalCode: "95051",
    addressCountry: "US",
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

Supported backend shapes include top-level `{ items, page, pageSize, total }`, legacy nested `{ items, pagination }`, and plain arrays.

Status labels are centralized in `src/lib/constants/status.ts`. Inbound package and customer shipment UI submit only canonical simplified statuses while retaining display compatibility for old enum values during migration.

Admin-facing customer identity uses `customerCode` such as `GJ3178`. Internal `customerId` UUID values are backend foreign keys and should not be presented as customer numbers. Admin create forms must not ask for or submit `customerId` unless an endpoint explicitly requires an internal id.

`src/components/admin/CustomerCodeInput.tsx` is the reusable admin customer-code input. It renders a fixed left `GJ` segment and lets admins enter only four digits. The component value and parent form state always use the full code (`""` or `GJ3178`), so payloads can submit `customerCode` directly.

Admin customer shipment create submits `customerCode`; the backend resolves it to the internal `customer_id` UUID FK. Customer shipment decimal fields (`actualWeightKg`, `billingRateCnyPerKg`, and `billingWeightKg`) are sent as trimmed strings in API payloads. The displayed payable amount is `billingRateCnyPerKg * billingWeightKg`, formatted as CNY when both decimal strings are valid.

Customer shipment create notes end with exactly one `应付费用：...` line. If the amount can be calculated, the line uses the formatted payable amount; otherwise it uses `应付费用：待确认`.

Admin detail pages must hydrate from their detail APIs on page load using route params, not from list-page state. This keeps `/admin/customers/:id` and `/admin/inbound-packages/:id` refresh-safe and direct-link safe.

Admin detail pages must unwrap detail API responses before storing entity state. Backend detail responses may arrive as a raw object, `{ item }`, or `{ data }`; pages should use the shared unwrap helper instead of putting wrapper objects into state.

When displaying a shortened id, use `safeShortId()` instead of calling `value.slice(...)` directly. Detail pages should fall back to the route id or `未编号` when the entity id is missing.

Admin create modals close and reset after successful creation, then refresh the list. If the create request fails, the modal remains open and keeps the admin's entered values.

Inbound package image uploads must only run after create returns a real package `id`. If the create response does not include an id in raw object, `{ item }`, or `{ data }`, the frontend stops image upload and shows an explicit error instead of calling `/undefined/images`.

Customer shipment image uploads follow the same rule: create first through the backend API, extract a real shipment `id`, then upload images through `/admin/customer-shipments/:id/images`.

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

### 6.4 Internal Linking Strategy

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
- Services: Registration, tracking, compliance, FAQ
- Register: Privacy, services, compliance
- Compliance: Terms, compensation, registration
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
- ❌ No telephone, openingHours, or ratings
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
