import type { Metadata } from 'next';
import Link from 'next/link';
import { Plane, Clock, Shield, Package, CheckCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '中美空运服务',
  description: `了解${SITE_CONFIG.brandDisplayName}的中美空运服务：适合紧急包裹，时效快，全程可追踪，入库拍照确认。`,
};

const features = [
  {
    icon: Clock,
    title: '时效更快',
    description: '相比海运，空运时效更快，适合紧急包裹',
  },
  {
    icon: Shield,
    title: '安全可靠',
    description: '全程物流追踪，包裹状态实时可查',
  },
  {
    icon: Package,
    title: '入库拍照',
    description: '包裹到达国内仓后拍照确认，让您安心',
  },
];

const suitableFor = [
  '紧急需要的物品',
  '小件商品',
  '贵重物品',
  '时效敏感的商品',
  '样品或急件',
];

const chargeableWeightInfo = [
  { label: '实际重量', value: '包裹的实际称重重量' },
  { label: '体积重量', value: '长(cm) × 宽(cm) × 高(cm) / 6000' },
  { label: '计费重量', value: '取实际重量和体积重量的较大者' },
];

export default function AirFreightPage() {
  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-green-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 mx-auto mb-6">
              <Plane className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">中美空运服务</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              适合紧急包裹，时效更快，全程可追踪
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                  <feature.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suitable For */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">适合哪些包裹</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suitableFor.map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chargeable Weight */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">计费重量说明</h2>
            <div className="space-y-4">
              {chargeableWeightInfo.map((info, index) => (
                <div key={info.label} className="flex items-start gap-4 p-6 rounded-lg border bg-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{info.label}</h3>
                    <p className="text-muted-foreground">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>提示：</strong> 体积大的轻泡货物可能按体积重量计费。
                例如：30cm × 20cm × 15cm 的包裹，体积重量为 30×20×15/6000 = 1.5kg。
                如果实际重量为 1kg，则按 1.5kg 计费。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-8">空运流程</h2>
            <div className="text-left space-y-6">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">包裹到达国内仓</h3>
                  <p className="text-sm text-muted-foreground">仓库拍照、称重、入库</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">用户确认包裹</h3>
                  <p className="text-sm text-muted-foreground">在小程序查看照片并确认</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">确认支付</h3>
                  <p className="text-sm text-muted-foreground">完成支付后安排发货</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">国际空运</h3>
                  <p className="text-sm text-muted-foreground">安排空运并提供追踪单号</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold">收货确认</h3>
                  <p className="text-sm text-muted-foreground">包裹到达后扫码确认收货</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">了解更多</h2>
            <p className="mt-4 text-muted-foreground">
              联系客服获取空运服务的详细信息
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services/sea-freight"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查看海运服务
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-green-700"
              >
                联系客服
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
