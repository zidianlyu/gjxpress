import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Package, Plane, Ship, Camera, Scale, MapPin, CheckCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '服务介绍',
  description: `了解${SITE_CONFIG.brandDisplayName}的中美跨境供应链与物流信息服务：入库拍照、包裹确认、发货管理与物流查询。`,
};

const services = [
  {
    icon: Package,
    title: '中美跨境物流',
    description: '提供中国到美国的包裹转运服务，支持多种运输方式',
    href: '/services/china-us-shipping',
    features: ['国内仓收货', '包裹拍照', '合单发货', '物流追踪'],
  },
  {
    icon: Plane,
    title: '空运服务',
    description: '适合紧急包裹，时效更快，全程可追踪',
    href: '/services/air-freight',
    features: ['时效快', '全程追踪', '安全可靠', '门到门服务'],
  },
  {
    icon: Ship,
    title: '海运服务',
    description: '适合大件重货，经济实惠，支持多个包裹合单',
    href: '/services/sea-freight',
    features: ['经济实惠', '大件友好', '合单优惠', '稳定可靠'],
  },
];

const workflowSteps = [
  {
    icon: MapPin,
    title: '获取仓库地址',
    description: '在小程序中获取您的专属国内仓地址',
  },
  {
    icon: Package,
    title: '电商平台下单',
    description: '将商品寄到国内仓，备注您的用户ID',
  },
  {
    icon: Camera,
    title: '入库拍照确认',
    description: '仓库收到包裹后拍照、称重、入库',
  },
  {
    icon: Scale,
    title: '用户确认支付',
    description: '您在小程序查看照片并确认包裹',
  },
  {
    icon: Plane,
    title: '国际发货',
    description: '确认支付后安排国际运输',
  },
  {
    icon: CheckCircle,
    title: '收货确认',
    description: '包裹到达后扫码确认收货',
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight">服务介绍</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {SITE_CONFIG.name}提供跨境供应链与物流信息服务，<br className="hidden md:block" />
              包括仓储入库、包裹确认、发货管理与物流查询
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="flex flex-col p-6 rounded-lg border bg-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={service.href}
                  className="mt-auto inline-flex items-center text-primary hover:underline"
                >
                  了解详情 <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">服务流程</h2>
            <p className="mt-4 text-muted-foreground">
              简单六步，完成中美跨境物流
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {workflowSteps.map((step) => (
              <div key={step.title} className="flex flex-col items-center text-center p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">我们的优势</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">入库拍照透明化</h3>
                <p className="text-sm text-muted-foreground">
                  每个包裹到达国内仓后，我们都会拍摄外包装、面单和内部物品照片，
                  您可以在小程序中实时查看，确保货物无误。
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">精准计费系统</h3>
                <p className="text-sm text-muted-foreground">
                  根据实际重量和体积重量（长×宽×高/6000）取较大者计费，
                  费用透明，无隐藏收费。
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">灵活运输方式</h3>
                <p className="text-sm text-muted-foreground">
                  根据您的需求选择空运或海运，紧急包裹选空运，
                  大件重货选海运，还支持多个包裹合单发货。
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">全程物流追踪</h3>
                <p className="text-sm text-muted-foreground">
                  从国内仓入库到国际运输，再到美国本地派送，
                  全程可查询物流状态，让您安心等待。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">准备好开始了吗？</h2>
            <p className="mt-4 text-muted-foreground">
              了解更多服务详情，请联系我们的客服
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查看使用流程
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
