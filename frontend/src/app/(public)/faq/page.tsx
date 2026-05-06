import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ArrowRight, Search, FileText, Shield } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from '@/lib/structured-data';
import FaqSection from '@/components/public/FaqSection';
import { RelatedLinks } from '@/components/public/RelatedLinks';
import { faqData, faqCategories } from '@/lib/faq';

export const metadata: Metadata = buildMetadata({
  title: '常见问题｜广骏国际快运',
  description: '了解广骏国际快运的新客户注册、客户编号、包裹入库、计费规则、时效参考、品类限制和异常处理常见问题。',
  path: '/faq',
});

export default function FaqPage() {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '常见问题', path: '/faq' },
  ]);

  const faqJsonLdData = buildFaqJsonLd(faqData);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={faqJsonLdData} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
              <HelpCircle className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">常见问题</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              了解新客户注册、客户编号、包裹入库、计费规则、时效参考、品类限制和异常处理。
            </p>
          </div>

          {/* FAQ Categories */}
          <FaqSection
            faqs={faqData}
            categories={faqCategories}
            showCategories={true}
            className="mb-16"
          />

          {/* CTA Section */}
          <div className="border-t pt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-4">需要更多帮助？</h2>
              <p className="text-muted-foreground">
                如果您的问题没有在上方找到答案，可以通过以下方式了解更多。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/register"
                className="flex flex-col items-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">新客户注册</h3>
                <p className="text-sm text-muted-foreground text-center">提交注册信息获取客户编号</p>
              </Link>

              <Link
                href="/tracking"
                className="flex flex-col items-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">查询物流状态</h3>
                <p className="text-sm text-muted-foreground text-center">通过单号查询包裹状态</p>
              </Link>

              <Link
                href="/services"
                className="flex flex-col items-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">查看服务介绍</h3>
                <p className="text-sm text-muted-foreground text-center">了解详细服务流程</p>
              </Link>

              <Link
                href="/compliance"
                className="flex flex-col items-center p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">查看合规说明</h3>
                <p className="text-sm text-muted-foreground text-center">了解品类限制和要求</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-4xl">
          <RelatedLinks
            links={[
              { label: "服务介绍", href: "/services" },
              { label: "新客户注册", href: "/register" },
              { label: "物流状态查询", href: "/tracking" },
              { label: "合规说明", href: "/compliance" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
