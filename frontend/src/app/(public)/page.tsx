import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Package, Search, Truck, Warehouse, CheckCircle, Globe } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${SITE_CONFIG.brandDisplayName}｜${SITE_CONFIG.slogan}`,
  description: '广骏供应链服务提供跨境供应链与物流信息服务，支持包裹入库记录、集运单状态查询与海外仓状态管理。',
};

const valueProps = [
  {
    icon: Warehouse,
    title: '仓储入库记录',
    description: '每个包裹入库时记录状态与信息，方便追溯查询',
  },
  {
    icon: Package,
    title: '包裹状态管理',
    description: '从入库到出库，全流程状态清晰可见',
  },
  {
    icon: Truck,
    title: '集运单跟踪',
    description: '客户集运单状态实时同步，海外仓到达即时更新',
  },
  {
    icon: Globe,
    title: '国际运输状态',
    description: '国际批次运输阶段同步，公开批次状态可查',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              {SITE_CONFIG.brandDisplayName}
            </h1>
            <p className="mt-4 text-xl text-blue-600 font-medium">
              {SITE_CONFIG.slogan}
            </p>
            <p className="mt-6 text-lg text-muted-foreground">
              提供跨境供应链与物流信息服务，支持仓储入库、包裹状态查询、集运单状态跟踪与海外仓取件状态管理。
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/tracking"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Search className="mr-2 h-4 w-4" />
                查询物流状态
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查看服务介绍
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

      {/* Value Props Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">服务能力</h2>
            <p className="mt-4 text-muted-foreground">
              透明、可追踪、规范化的供应链信息管理
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

      {/* Trust Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">透明可信的物流信息服务</h2>
            <p className="mt-4 text-muted-foreground">
              看得见的跨境物流，让每一步都有据可查
            </p>
            <div className="mt-8 space-y-4 text-left inline-block">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">入库状态记录</p>
                  <p className="text-sm text-muted-foreground">每个包裹入库时记录拍照与重量信息</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">公开状态查询</p>
                  <p className="text-sm text-muted-foreground">通过单号查询低敏物流状态，无需登录</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">批次状态公开</p>
                  <p className="text-sm text-muted-foreground">国际批次运输状态公开可查，信息及时同步</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">开始查询</h2>
            <p className="mt-4 text-muted-foreground">
              输入国内快递单号或集运单号，查询当前物流状态
            </p>
            <div className="mt-8">
              <Link
                href="/tracking"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                查询物流状态
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
