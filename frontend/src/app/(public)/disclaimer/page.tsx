import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Info } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = buildMetadata({
  title: '免责声明｜广骏供应链服务',
  description: '了解广骏供应链服务页面信息、费用、时效和状态查询的免责声明。',
  path: '/disclaimer',
});

export default function DisclaimerPage() {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '免责声明', path: '/disclaimer' },
  ]);
  return (
    <>
      <JsonLd data={breadcrumbData} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">免责声明</h1>
          <p className="mt-2 text-muted-foreground">最后更新：2025年5月</p>
        </div>

        <div className="space-y-6">
          {/* 1. Page Info */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">页面信息</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              本网站页面内容仅作服务说明和参考，不构成法律合同、承运承诺或固定报价。
            </p>
          </div>

          {/* 2. Fees & Scope Changes */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">费用与承接范围</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              页面展示的费用、时效和承接范围可能根据承运商、监管要求和实际运营情况调整，恕不另行通知。实际费用和服务内容以工作人员确认和订单记录为准。
            </p>
          </div>

          {/* 3. Timing */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">时效参考</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              页面展示的时效均为参考，不构成固定到达时间承诺。实际时效可能受承运商处理、航班/船期、查验、天气、节假日、运输安排和其他不可控因素影响。
            </p>
          </div>

          {/* 4. Tracking Status */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">物流状态查询</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              物流状态查询的结果来源于系统记录和承运商数据，可能存在延迟或不完整的情况。如发现状态与实际不符，请联系工作人员核实。
            </p>
          </div>

          {/* 5. Restricted Items */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">禁止与限制品类</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              对法律法规、监管部门、承运商或服务商禁止或限制运输的品类，不提供承接承诺。详细品类说明请参阅<Link href="/compliance" className="text-primary hover:underline">合规说明</Link>。
            </p>
          </div>

          {/* 6. Final Authority */}
          <div className="flex items-start gap-3 p-5 rounded-lg border border-blue-200 bg-blue-50">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-blue-900 mb-2">服务确认</h2>
              <p className="text-sm text-blue-800 leading-relaxed">
                具体服务内容、费用、时效和限制条件以实际订单记录及工作人员确认为准。
              </p>
            </div>
          </div>

          {/* Related Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/compliance" className="text-sm text-primary hover:underline">查看合规说明 &rarr;</Link>
            <Link href="/terms" className="text-sm text-primary hover:underline">查看服务条款 &rarr;</Link>
            <Link href="/compensation" className="text-sm text-primary hover:underline">查看异常与赔付说明 &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
