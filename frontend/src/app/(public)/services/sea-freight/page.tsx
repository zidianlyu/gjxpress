import type { Metadata } from 'next';
import Link from 'next/link';
import { Ship, Scale, Package, DollarSign, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '海运服务｜广骏国际快运',
  description: '了解广骏国际快运的中美海运服务：适合大件重货，支持合箱出库，入库拍照记录。',
  alternates: {
    canonical: '/services/sea-freight',
  },
};

const features = [
  {
    icon: DollarSign,
    title: '经济实惠',
    description: '相比空运，海运费用参考价更低，适合大件重货',
  },
  {
    icon: Package,
    title: '支持合单',
    description: '多个包裹可以合箱整理后一起出库，可能节省费用',
  },
  {
    icon: Scale,
    title: '大件友好',
    description: '适合体积大、重量重的商品运输',
  },
];

const suitableFor = [
  '大件商品',
  '重量较重的包裹',
  '不急需的物品',
  '批量采购的商品',
  '家具或家电等大件',
];

const chargeableWeightInfo = [
  { label: '实际重量', value: '包裹的实际称重重量' },
  { label: '体积重量', value: '长(cm) × 宽(cm) × 高(cm) / 6000' },
  { label: '计费重量', value: '取实际重量和体积重量的较大者' },
];

export default function SeaFreightPage() {
  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-amber-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 mx-auto mb-6">
              <Ship className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">中美海运服务</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              适合大件重货，经济实惠，支持合单
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
                  <feature.icon className="h-8 w-8 text-amber-600" />
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">适合哪些包裹</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {suitableFor.map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <CheckCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Package Consolidation */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">包裹合单服务</h2>
            <div className="p-8 rounded-lg border bg-card">
              <p className="text-muted-foreground mb-6">
                海运服务支持包裹合箱整理，您可以在国内电商平台多次下单，
                包裹到达国内仓后先暂存，待所有包裹到齐后合箱整理并安排出库。
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">多次下单</p>
                    <p className="text-sm text-muted-foreground">在不同时间、不同平台下单，都寄到同一国内仓地址</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">分别入库</p>
                    <p className="text-sm text-muted-foreground">每个包裹到达后分别拍照、称重、入库</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">确认合箱</p>
                    <p className="text-sm text-muted-foreground">工作人员确认所有包裹无误后安排合箱整理</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">合箱出库</p>
                    <p className="text-sm text-muted-foreground">仓库将多个包裹合箱打包，按计费重量确认费用</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chargeable Weight */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">计费重量说明</h2>
            <div className="space-y-4">
              {chargeableWeightInfo.map((info, index) => (
                <div key={info.label} className="flex items-start gap-4 p-6 rounded-lg border bg-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold shrink-0">
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
                <strong>提示：</strong> 海运同样按照计费重量确认费用。
                合箱后按总计费重量确认，可能相比单独发货更经济。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-8">海运流程</h2>
            <div className="text-left space-y-6">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">包裹到达国内仓</h3>
                  <p className="text-sm text-muted-foreground">仓库拍照、称重、入库暂存</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">确认包裹信息</h3>
                  <p className="text-sm text-muted-foreground">工作人员核对包裹信息并确认</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">合箱整理与费用确认</h3>
                  <p className="text-sm text-muted-foreground">合箱打包后确认计费重量和费用</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">安排海运出库</h3>
                  <p className="text-sm text-muted-foreground">安排海运并记录物流状态</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-semibold">国际海运</h3>
                  <p className="text-sm text-muted-foreground">安排海运并提供追踪信息</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 font-bold shrink-0">
                  6
                </div>
                <div>
                  <h3 className="font-semibold">美国段取货</h3>
                  <p className="text-sm text-muted-foreground">到达美国后根据通知安排取货</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">了解更多</h2>
            <p className="mt-4 text-muted-foreground">
              了解其他服务或查看合规说明
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services/air-freight"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查看空运服务
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                返回服务介绍
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
