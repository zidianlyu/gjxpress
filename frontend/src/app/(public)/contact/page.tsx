import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { buildBreadcrumbJsonLd, buildOrganizationJsonLd } from '@/lib/structured-data';
import { PublicContactCards } from '@/components/public/PublicContactCards';

const contactMetadata = buildMetadata({
  title: '联系我们｜广骏国际快运',
  description: '联系广骏国际快运，咨询中国到美国跨境物流线路、包裹入库、合箱出库和美国段交接安排。',
  path: '/contact',
});

export const metadata: Metadata = {
  ...contactMetadata,
  title: '联系我们｜广骏国际快运',
  openGraph: contactMetadata.openGraph
    ? { ...contactMetadata.openGraph, title: '联系我们｜广骏国际快运' }
    : undefined,
  twitter: contactMetadata.twitter
    ? { ...contactMetadata.twitter, title: '联系我们｜广骏国际快运' }
    : undefined,
};

export default function ContactPage() {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '联系我们', path: '/contact' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={buildOrganizationJsonLd()} />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight">联系我们</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              如需咨询中国到美国线路、包裹入库、合箱出库或美国段交接安排，可以通过以下方式联系工作人员。
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <PublicContactCards />
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {siteConfig.publicContacts.note}
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-5">
              <h2 className="font-semibold">注册前可以先咨询吗？</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                可以。建议先说明包裹品类、数量、重量预估和希望了解的线路。
              </p>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <h2 className="font-semibold">如何说明自己的包裹情况？</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                可以提供商品类型、件数、是否需要合箱、是否有特殊包装或交接要求。
              </p>
            </div>
            <div className="rounded-lg border bg-card p-5">
              <h2 className="font-semibold">客户编号是什么？</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                客户编号用于包裹归属识别。注册提交后会生成，审核通过后用于后续包裹备注。
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              已确认后去注册
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
