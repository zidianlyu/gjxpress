import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldAlert, Search, Warehouse, Truck, PackageMinus,
  GlassWater, PackageCheck, XCircle, ArrowRight,
} from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from '@/lib/structured-data';
import FaqSection from '@/components/public/FaqSection';
import { RelatedLinks } from '@/components/public/RelatedLinks';
import { compensationFaqs } from '@/lib/faq';

export const metadata: Metadata = buildMetadata({
  title: '异常与赔付说明｜广骏供应链服务',
  description: '了解包裹异常、少件、破损、延误和承运商异常情况下的处理原则与反馈要求。',
  path: '/compensation',
});

export default function CompensationPage() {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '异常与赔付说明', path: '/compensation' },
  ]);

  const faqJsonLdData = buildFaqJsonLd(compensationFaqs);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      <JsonLd data={faqJsonLdData} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <ShieldAlert className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">异常与赔付说明</h1>
          <p className="mt-2 text-muted-foreground">最后更新：2025年5月</p>
        </div>

        <div className="space-y-6">
          {/* 1. Principle */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">处理原则</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如包裹出现丢失、破损、少件、延误或承运商异常，工作人员会根据入库记录、出库照片、集运单记录、承运商状态和客户提供的信息协助核查。处理结果以实际记录和责任认定为准。
            </p>
          </div>

          {/* 2. Feedback Timeline */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">反馈时限</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              客户收到包裹后应尽快核对物品。如发现少件、破损或异常，建议在一周内联系工作人员，并提供照片、视频、订单号或其他可核验信息。超过反馈时限可能影响核查和处理。
            </p>
          </div>

          {/* 3. Warehouse Stage */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Warehouse className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">仓库阶段异常</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如果包裹在出库前无法找到，工作人员会根据入库记录、照片、扫描记录和仓库操作记录协助查找。是否适用赔付以及赔付方式，以实际记录和责任认定为准。
            </p>
          </div>

          {/* 4. Transit Stage */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">出库后运输阶段异常</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              出库后的异常需要结合承运商状态、批次记录、签收信息、出库照片和实际责任归属处理。工作人员会协助沟通和提交必要资料。承运商理赔结果可能受其自身规则限制。
            </p>
          </div>

          {/* 5. Partial Missing */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <PackageMinus className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">部分少件</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如收到包裹后发现部分少件，请尽快提供开箱照片/视频、包裹外观、出库照片对比和缺失物品信息，以便核查。核查结果以入库记录、出库记录和实际责任认定为准。
            </p>
          </div>

          {/* 6. Fragile & Special */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <GlassWater className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">易碎品和特殊品类</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              易碎品、特殊材质商品和需特殊保存条件的商品，在运输过程中存在更高风险。工作人员会尽量协助包装和提醒，但破损责任需结合实际包装、商品属性和承运商处理情况判断。
            </p>
          </div>

          {/* 7. Signed but not received */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">显示签收但未收到</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如果承运商状态显示已签收，但客户反馈未收到，需要结合派送记录、签收地址、承运商调查结果和客户提供的信息处理。工作人员可协助沟通，但承运商最终理赔结果可能受其规则限制。
            </p>
          </div>

          {/* 8. Exclusions */}
          <div className="p-6 rounded-lg border border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-5 w-5 text-amber-600" />
              <h2 className="font-semibold text-amber-900">不适用或可能限制赔付的情形</h2>
            </div>
            <ul className="list-disc list-inside text-sm text-amber-800 space-y-1.5">
              <li>超过反馈时限</li>
              <li>用户信息填写错误</li>
              <li>物品属于禁止或限制承接品类</li>
              <li>商品本身易碎或存在固有风险</li>
              <li>承运商已按地址完成签收</li>
              <li>用户无法提供可核验资料</li>
              <li>其他非服务方可控因素</li>
            </ul>
          </div>

          {/* 9. CTA */}
          <div className="p-6 rounded-lg border bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              遇到包裹异常？请联系工作人员并准备好相关照片和信息。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/compliance"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
              >
                查看合规说明
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
              >
                查看服务条款
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>

        {/* FAQ Section */}
        <div className="mt-16 pt-16 border-t">
          <FaqSection
            title="异常处理常见问题"
            description="关于包裹异常和反馈要求的常见问题"
            faqs={compensationFaqs}
          />
        </div>

        {/* Related Links */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-3xl">
            <RelatedLinks
              links={[
                { label: "合规说明", href: "/compliance" },
                { label: "服务条款", href: "/terms" },
                { label: "新客户注册", href: "/register" },
              ]}
            />
          </div>
        </div>
    </>
  );
}
