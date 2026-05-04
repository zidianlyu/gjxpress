import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Camera, Scale, Plane, Ship, Package, CheckCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '中美跨境物流服务',
  description: `${SITE_CONFIG.brandDisplayName}提供中美跨境供应链与物流信息服务，支持入库拍照、包裹确认、发货管理与物流查询。`,
};

const valueProps = [
  {
    icon: Camera,
    title: '入库拍照',
    description: '每个包裹入库时拍照存档，让您实时查看货物状态',
  },
  {
    icon: Scale,
    title: '全程透明',
    description: '重量、体积、费用全程透明，无隐藏收费',
  },
  {
    icon: Plane,
    title: '空运直达',
    description: '紧急包裹可选择空运，时效更快',
  },
  {
    icon: Ship,
    title: '海运经济',
    description: '大件重货选择海运，性价比更高',
  },
];

const howItWorksSteps = [
  '复制国内仓地址',
  '在电商平台下单',
  '包裹到达国内仓',
  '仓库拍照入库',
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              {SITE_CONFIG.brandDisplayName}
            </h1>
            <p className="mt-4 text-xl text-blue-600 font-medium">
              {SITE_CONFIG.slogan}
            </p>
            <p className="mt-6 text-lg text-muted-foreground">
              提供中美跨境供应链与物流信息服务，支持国内仓入库拍照、包裹确认、发货管理与物流查询。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                查看服务流程
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                联系客服
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">为什么选择我们</h2>
            <p className="mt-4 text-muted-foreground">
              专注中美跨境物流，为您提供看得见的服务体验
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="flex flex-col items-center text-center p-6 rounded-lg border bg-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <prop.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{prop.title}</h3>
                <p className="text-sm text-muted-foreground">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">简单四步，轻松寄送</h2>
            <p className="mt-4 text-muted-foreground">
              从下单到收货，全程透明可追溯
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  {index + 1}
                </div>
                <p className="font-medium">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              查看完整流程
            </Link>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">我们的服务</h2>
            <p className="mt-4 text-muted-foreground">
              根据您的需求选择合适的物流方案
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/services/china-us-shipping" className="group">
              <div className="flex flex-col h-full p-6 rounded-lg border bg-card transition-colors hover:border-primary/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">中美跨境物流</h3>
                <p className="text-muted-foreground flex-1">
                  专业的中美集运服务，支持多种运输方式，全程物流追踪
                </p>
                <span className="mt-4 inline-flex items-center text-primary group-hover:underline">
                  了解更多 <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link href="/services/air-freight" className="group">
              <div className="flex flex-col h-full p-6 rounded-lg border bg-card transition-colors hover:border-primary/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <Plane className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">空运服务</h3>
                <p className="text-muted-foreground flex-1">
                  适合紧急包裹，时效快，全程可追踪
                </p>
                <span className="mt-4 inline-flex items-center text-primary group-hover:underline">
                  了解更多 <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link href="/services/sea-freight" className="group">
              <div className="flex flex-col h-full p-6 rounded-lg border bg-card transition-colors hover:border-primary/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
                  <Ship className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">海运服务</h3>
                <p className="text-muted-foreground flex-1">
                  适合大件重货，经济实惠，支持合单
                </p>
                <span className="mt-4 inline-flex items-center text-primary group-hover:underline">
                  了解更多 <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">透明的物流体验</h2>
            <p className="mt-4 text-muted-foreground">
              我们相信，看得见的物流才能建立信任
            </p>
            <div className="mt-8 space-y-4 text-left inline-block">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">入库拍照确认</p>
                  <p className="text-sm text-muted-foreground">每个包裹入库时拍照，您可以在小程序中查看</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">精准称重计费</p>
                  <p className="text-sm text-muted-foreground">实际重量与体积重量，取大者计费，透明无隐藏</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">全程物流追踪</p>
                  <p className="text-sm text-muted-foreground">从国内仓到收货地址，全程可查物流状态</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">准备开始了吗？</h2>
            <p className="mt-4 text-muted-foreground">
              联系我们的客服，了解更多服务详情
            </p>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                联系客服咨询
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
