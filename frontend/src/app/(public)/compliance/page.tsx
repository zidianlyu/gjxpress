import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, CheckCircle, AlertTriangle, XCircle, Info, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: '合规说明｜广骏国际快运',
  description: '了解广骏国际快运的品类说明、用户责任、时效边界和暂不承接物品说明。',
};

export default function CompliancePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">合规说明</h1>
          <p className="mt-2 text-muted-foreground">最后更新：2025年5月</p>
        </div>

        <div className="space-y-6">
          {/* 1. Service Positioning */}
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">服务定位</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              广骏供应链服务提供跨境物流信息与转运协助服务。本页面信息用于帮助客户了解服务流程、品类限制、时效参考和服务边界，不构成法律意见或承运承诺。
            </p>
          </div>

          {/* 2-4. Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Normal Categories */}
            <div className="p-5 rounded-lg border border-green-200 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h2 className="font-semibold text-green-900">普通品类</h2>
              </div>
              <ul className="text-sm text-green-800 space-y-1.5">
                <li>衣物</li>
                <li>鞋帽</li>
                <li>普通家居用品</li>
                <li>普通饰品</li>
                <li>普通日用品</li>
              </ul>
              <p className="mt-3 text-xs text-green-700 leading-relaxed">
                一般可按常规线路处理，具体以工作人员确认和实际订单记录为准。
              </p>
            </div>

            {/* Requires Confirmation */}
            <div className="p-5 rounded-lg border border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h2 className="font-semibold text-amber-900">需提前确认</h2>
              </div>
              <ul className="text-sm text-amber-800 space-y-1.5">
                <li>带电产品</li>
                <li>液体 / 膏体</li>
                <li>化妆品</li>
                <li>食品</li>
                <li>药品或医疗相关</li>
                <li>品牌商品</li>
                <li>高价值商品</li>
                <li>易碎品</li>
              </ul>
              <p className="mt-3 text-xs text-amber-700 leading-relaxed">
                请在入库或出货前联系工作人员确认是否可承接、适用线路、包装要求和注意事项。
              </p>
            </div>

            {/* Not Accepted */}
            <div className="p-5 rounded-lg border border-red-200 bg-red-50">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <h2 className="font-semibold text-red-900">暂不承接</h2>
              </div>
              <p className="text-sm text-red-800 leading-relaxed">
                法律法规、监管部门、承运商或服务商禁止/限制运输的物品，包括但不限于：
              </p>
              <ul className="mt-2 text-sm text-red-800 space-y-1.5">
                <li>危险品、易燃易爆物</li>
                <li>受管制物品</li>
                <li>活体动物</li>
                <li>新鲜果蔬</li>
                <li>酒类、烟草</li>
                <li>需冷藏保存的物品</li>
                <li>其他违法违禁物品</li>
              </ul>
            </div>
          </div>

          {/* 5. User Responsibility */}
          <div className="flex items-start gap-3 p-5 rounded-lg border border-blue-200 bg-blue-50">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-blue-900 mb-2">用户责任</h2>
              <p className="text-sm text-blue-800 leading-relaxed">
                客户应确保提交和运输的物品符合中国、美国及承运商相关规定。因商品属性、资料不完整、监管查验、承运商限制或用户提供信息不准确导致的延误、退回、扣留、额外费用或其他问题，需根据实际情况处理。
              </p>
            </div>
          </div>

          {/* 6. Timing Boundary */}
          <div className="flex items-start gap-3 p-5 rounded-lg border border-amber-200 bg-amber-50">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-amber-900 mb-2">时效边界</h2>
              <p className="text-sm text-amber-800 leading-relaxed">
                页面展示的时效均为参考，不构成固定到达时间承诺。实际时效可能受航班/船期、承运商处理、查验、天气、节假日和其他不可控因素影响。
              </p>
            </div>
          </div>

          {/* Related Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/terms" className="text-sm text-primary hover:underline">查看服务条款 &rarr;</Link>
            <Link href="/compensation" className="text-sm text-primary hover:underline">查看异常与赔付说明 &rarr;</Link>
            <Link href="/privacy" className="text-sm text-primary hover:underline">查看隐私政策 &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
