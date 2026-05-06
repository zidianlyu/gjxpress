import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, DollarSign, Scale, Clock, User, AlertTriangle, MapPin, RefreshCw, Package } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { RelatedLinks } from '@/components/public/RelatedLinks';

export const metadata: Metadata = buildMetadata({
  title: '服务条款｜广骏供应链服务',
  description: '了解广骏供应链服务的费用说明、计费规则、时效说明、客户责任和异常处理规则。',
  path: '/terms',
});

export default function TermsPage() {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '服务条款', path: '/terms' },
  ]);
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">服务条款</h1>
          <p className="mt-2 text-muted-foreground">最后更新：2025年5月</p>
        </div>

        <div className="space-y-6">
          {/* 1. Purpose */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">页面用途</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              本页面用于说明广骏供应链服务的使用规则、费用确认、时效参考、异常处理和客户责任。页面内容不构成法律合同，具体服务内容以实际订单记录和工作人员确认为准。
            </p>
          </div>

          {/* 2. Fees */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">费用说明</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              费用参考仅用于帮助客户了解大致费用范围。实际费用以打包后的实际重量、体积重、计费重量、线路、品类和工作人员确认为准。
            </p>
          </div>

          {/* 3. Chargeable Weight */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">计费重量</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              包裹打包后，会根据实际重量和体积重进行比较，取较大值作为计费重量。计费重量可能按进位规则计算。最终费用以实际打包记录和工作人员确认为准。
            </p>
          </div>

          {/* 4. Timing */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">时效说明</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              所有时效仅为参考，不构成固定到达时间承诺。不承接对固定到达时间有强要求的急单。实际时效可能受航班/船期、承运商处理、查验、天气、节假日和其他不可控因素影响。
            </p>
          </div>

          {/* 5. Customer Data */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">客户资料</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              客户应确保手机号、微信号、客户编号、国内退货地址、国内快递单号和其他提交信息真实、准确、可联系。因客户提供信息不准确或不完整导致的问题，需根据实际情况处理。
            </p>
          </div>

          {/* 6. Exception Handling */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">异常处理</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如出现延误、少件、破损、丢失、承运商异常或其他问题，客户应及时联系工作人员，并提供可核验的信息和照片。详细异常处理原则请参阅<Link href="/compensation" className="text-primary hover:underline">异常与赔付说明</Link>。
            </p>
          </div>

          {/* 7. Handoff & Storage */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">递送与保管</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              到达美国段后，工作人员会根据包裹状态和客户需求确认本地递送或预约交接安排。具体交接方式、时间和可能产生的本地服务费用，以工作人员确认为准。超过基础保管期后，可能产生存放费用。
            </p>
          </div>

          {/* 8. Service Changes */}
          <div className="p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">服务变更</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              线路、费用、时效和承接范围可能根据承运商、监管要求和实际运营情况调整。调整后的内容以页面更新和工作人员确认为准。
            </p>
          </div>

          {/* Related Links */}
          <RelatedLinks
            links={[
              { label: "合规说明", href: "/compliance" },
              { label: "异常与赔付说明", href: "/compensation" },
              { label: "隐私政策", href: "/privacy" },
            ]}
          />
        </div>
      </div>
    </div>
    </>
  );
}
