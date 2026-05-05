# Web Logistics Phase 1 — Frontend Implementation

## Status: ✅ Complete (Build Passes)

## Architecture

- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4
- **State**: Client-side with localStorage for admin auth
- **API**: Unified `apiFetch` via `lib/api/client.ts`

## Route Structure

```
src/app/
├── (public)/           # Public pages with SiteHeader/SiteFooter
│   ├── page.tsx        # Home (/)
│   ├── about/          # /about
│   ├── services/       # /services, /services/air-freight, etc.
│   ├── team/           # /team
│   ├── tracking/       # /tracking (client, interactive)
│   ├── batch-updates/  # /batch-updates, /batch-updates/[batchNo]
│   ├── compliance/     # /compliance
│   ├── privacy/        # /privacy
│   ├── terms/          # /terms
│   └── disclaimer/     # /disclaimer
├── (admin)/            # Admin pages with AdminSidebar
│   └── admin/
│       ├── page.tsx                # /admin (dashboard)
│       ├── login/                  # /admin/login
│       ├── customers/              # /admin/customers
│       ├── inbound-packages/       # /admin/inbound-packages
│       ├── customer-shipments/     # /admin/customer-shipments
│       ├── master-shipments/       # /admin/master-shipments
│       └── transactions/           # /admin/transactions
├── layout.tsx          # Root layout (fonts, metadata)
├── globals.css         # Tailwind + design tokens
├── not-found.tsx       # 404
├── robots.ts           # SEO robots.txt
└── sitemap.ts          # SEO sitemap.xml
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/env.ts` | Normalized env var access (API base URL, site URL) |
| `src/lib/api/client.ts` | Core `apiFetch` with error handling, token support |
| `src/lib/api/admin-auth.ts` | Admin token storage, login/logout, `adminApiFetch` |
| `src/lib/api/admin.ts` | Admin API endpoints (customers, packages, shipments, transactions) |
| `src/lib/api/public.ts` | Public API endpoints (tracking, batch updates) |
| `src/types/admin.ts` | TypeScript types for admin entities |
| `src/types/public.ts` | TypeScript types for public entities |
| `src/types/api.ts` | Shared API response types |
| `src/lib/constants/index.ts` | Site config, navigation links |
| `src/lib/constants/status.ts` | Status labels & colors for badges |
| `src/components/common/StatusBadge.tsx` | Status badge component |
| `src/components/common/Pagination.tsx` | Pagination component |
| `src/hooks/useAdminAuth.ts` | Admin auth hook (useSyncExternalStore) |

## Admin Auth Flow

1. Login at `/admin/login` with phone number + password
2. Token stored in `localStorage` as `gjx_admin_access_token`
3. Admin user stored as `gjx_admin_user`
4. `adminApiFetch` auto-attaches Bearer token
5. On 401: clears token, redirects to `/admin/login`
6. Admin layout does client-side route guard check

## API Base URL

- Configured via `NEXT_PUBLIC_API_BASE_URL`
- Normalized in `lib/env.ts` to always end with `/api`
- Example: `https://api.gjxpress.net` → `https://api.gjxpress.net/api`

## Forbidden Content

The following terms/features are NOT present:
- 代购, 清关, 包税 (only in negation/disclaimer context)
- 微信支付, 支付宝, 立即支付
- No payment processing or user registration
- No direct Supabase calls
- No hardcoded backend URLs

## Build Verification

```
npm run build → ✅ Exit code 0
TypeScript → ✅ Pass
Static pages → 25 generated
No compilation errors
```
