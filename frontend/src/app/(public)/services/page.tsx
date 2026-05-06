import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Plane, Ship, MessageCircle, Warehouse, Camera,
  PackageOpen, Package, Truck, AlertTriangle, Info,
  Scale, Clock, MapPin,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '服务介绍｜广骏国际快运',
  description: '了解广骏国际快运的中国到美国跨境物流信息服务，包括入库记录、包裹拍照、合箱出库、费用参考、计费说明和时效说明。',
  alternates: {
    canonical: '/services',
  },
};

const baseServices = [
  { icon: MessageCircle, label: '咨询与线路建议' },
  { icon: Warehouse, label: '国内仓入库记录' },
  { icon: Camera, label: '包裹拍照' },
  { icon: PackageOpen, label: '拆箱与整理' },
  { icon: Package, label: '合箱出库' },
  { icon: Truck, label: '物流状态记录' },
  { icon: AlertTriangle, label: '异常协助' },
];

const pricingItems = [
  {
    title: '空运普通品类',
    price: '¥70/kg 起',
    note: '适合大部分常见商品',
    color: 'bg-green-50 border-green-200',
    iconColor: 'bg-green-100 text-green-600',
    icon: Plane,
  },
  {
    title: '空运需提前确认品类',
    price: '¥80/kg 起',
    note: '特殊品类需与工作人员确认',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'bg-blue-100 text-blue-600',
    icon: Plane,
  },
  {
    title: '海运普通品类',
    price: '¥25/kg 起',
    note: '适合大件和对时效要求不高的包裹',
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'bg-amber-100 text-amber-600',
    icon: Ship,
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight">服务介绍</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务，帮助客户清楚了解包裹从入库、整理、出库到美国段状态的全过程。
            </p>
          </div>
        </div>
      </section>

      {/* 1. Route Service */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-6">中国 → 美国线路服务</h2>
            <div className="p-6 rounded-lg border bg-card">
              <p className="text-muted-foreground leading-relaxed">
                我们专注中国 → 美国方向的跨境物流信息与转运协助服务，支持空运和海运等不同线路。不同线路的适用品类、费用和预计时效会有差异，建议在出货前联系工作人员确认。
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/services/air-freight"
                  className="inline-flex items-center gap-2 p-4 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 shrink-0">
                    <Plane className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">空运服务</p>
                    <p className="text-xs text-muted-foreground">时效相对更快</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </Link>
                <Link
                  href="/services/sea-freight"
                  className="inline-flex items-center gap-2 p-4 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 shrink-0">
                    <Ship className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold">海运服务</p>
                    <p className="text-xs text-muted-foreground">适合大件重货</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Base Services */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold tracking-tight">基础服务包含</h2>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-10 max-w-2xl mx-auto">
            以下基础服务通常包含在服务流程中，具体以实际订单和工作人员确认为准。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {baseServices.map((svc) => (
              <div key={svc.label} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <svc.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{svc.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Pricing Reference */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight">费用参考</h2>
            <p className="mt-4 text-muted-foreground">
              以下价格为参考起步价，部分需提前确认的品类费用可能不同
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingItems.map((item) => (
              <div key={item.title} className={`p-6 rounded-lg border ${item.color}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.iconColor} mb-4`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-2xl font-bold mb-2">{item.price}</p>
                <p className="text-sm text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 leading-relaxed">
                实际费用以打包后的实际重量、体积重、品类、线路和工作人员确认为准。部分需提前确认的品类，请先联系工作人员确认费用。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Chargeable Weight */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">计费说明</h2>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-start gap-3 mb-6">
                <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  所有包裹打包后，会根据实际重量和体积重进行比较，取较大值作为计费重量。计费重量按进位规则计算，最终费用以实际打包记录和工作人员确认为准。
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium mb-2">计费示例</p>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                  <div className="flex-1 p-3 rounded bg-background border">
                    <p className="font-medium text-foreground">实际重量</p>
                    <p>2 kg</p>
                  </div>
                  <div className="flex-1 p-3 rounded bg-background border">
                    <p className="font-medium text-foreground">体积重</p>
                    <p>2.548 kg</p>
                  </div>
                  <div className="flex-1 p-3 rounded bg-primary/5 border border-primary/20">
                    <p className="font-medium text-primary">计费重量</p>
                    <p>按 3 kg 计算</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Timing */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">时效说明</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <Plane className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold">空运</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  普通品类在资料和流程顺畅时，通常会比海运更快，具体时间以当次线路和承运商处理为准。
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                    <Ship className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold">海运</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  适合大件和对时效要求不高的包裹，预计时效受船期、港口、承运商处理和其他因素影响。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800 leading-relaxed">
                所有时效均为参考，不承接对固定到达时间有强要求的急单。实际时效可能受航班/船期、查验、天气、节假日、承运商处理和其他不可控因素影响。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. US Pickup Address */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">美国取货地址</h2>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-lg font-semibold mb-3">
                    2615 El Camino Real, Santa Clara, CA 95051
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    到达美国段后，请根据工作人员通知或系统状态安排取货。取货前建议确认现场是否有工作人员值班。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">开始使用</h2>
            <p className="mt-4 text-muted-foreground">
              注册成为客户、查询物流状态或了解合规说明
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                新客户注册
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/tracking"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查询物流状态
              </Link>
              <Link
                href="/compliance"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查看合规说明
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
