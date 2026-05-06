import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Search, UserPlus, Warehouse, Camera, PackageOpen,
  Truck, MapPin, CheckCircle, Info,
} from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { RelatedLinks } from '@/components/public/RelatedLinks';

export const metadata: Metadata = buildMetadata({
  title: '广骏国际快运｜看得见的跨境物流',
  description: '广骏供应链服务提供中国到美国方向的跨境物流信息与转运协助服务，支持入库记录、包裹拍照、合箱整理、物流状态查询与美国段取货状态管理。',
  path: '/',
});

const workflowSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: '新客户注册',
    description: '在线填写信息，获取专属客户编号',
  },
  {
    step: 2,
    icon: Warehouse,
    title: '电商平台下单',
    description: '在电商平台下单时备注客户编号，寄往国内仓地址',
  },
  {
    step: 3,
    icon: Camera,
    title: '国内仓入库',
    description: '仓库收到包裹后进行入库记录、拍照与称重',
  },
  {
    step: 4,
    icon: PackageOpen,
    title: '整理与合箱出库',
    description: '客服/仓库协助拆箱整理，按需合箱并安排出库',
  },
  {
    step: 5,
    icon: Truck,
    title: '国际运输状态记录',
    description: '通过空运或海运发出，物流状态在系统中记录更新',
  },
  {
    step: 6,
    icon: MapPin,
    title: '美国段取货确认',
    description: '到达美国后根据通知安排自提或后续服务确认',
  },
];

const advantages = [
  {
    icon: Camera,
    title: '包裹入库可记录',
    description: '每个包裹到达国内仓后，进行入库登记与拍照记录，便于后续核对与追溯。',
  },
  {
    icon: CheckCircle,
    title: '图片辅助确认',
    description: '入库照片可供客户查看，帮助确认包裹外观和内容，减少信息不对称。',
  },
  {
    icon: PackageOpen,
    title: '合箱和出库流程清晰',
    description: '拆箱整理、合箱打包、出库发货流程清晰记录，每一步都有据可查。',
  },
  {
    icon: Search,
    title: '状态查询减少沟通成本',
    description: '客户可通过单号自助查询物流状态，减少反复沟通，提高效率。',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              中国到美国，包裹状态看得见
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              广骏国际快运提供跨境供应链与物流信息服务，支持国内仓入库记录、包裹拍照、合箱整理、集运出库、物流状态查询与美国段取货状态管理。
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
                href="/register"
                className="inline-flex items-center justify-center rounded-md border border-primary text-primary bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-primary/5"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                新客户注册
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查看服务介绍
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Workflow Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">服务流程</h2>
            <p className="mt-4 text-muted-foreground">
              从注册到取货，六个步骤清晰了解全流程
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((item) => (
              <div
                key={item.step}
                className="relative flex items-start gap-4 p-6 rounded-lg border bg-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                  {item.step}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Advantages Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">核心优势</h2>
            <p className="mt-4 text-muted-foreground">
              透明、规范、高效的物流信息管理
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {advantages.map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-6 rounded-lg border bg-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Timing Note */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start gap-4 p-6 rounded-lg border border-amber-200 bg-amber-50">
              <Info className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">费用与时效提示</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  费用和时效与线路、品类、实际重量、体积重、承运商处理和其他因素有关，页面信息仅作参考，最终以实际打包记录和工作人员确认为准。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">开始使用</h2>
            <p className="mt-4 text-muted-foreground">
              注册成为客户或查询现有包裹状态
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                立即注册客户信息
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/tracking"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-4 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                查询包裹状态
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <RelatedLinks
              links={[
                { label: "服务介绍", href: "/services" },
                { label: "新客户注册", href: "/register" },
                { label: "物流状态查询", href: "/tracking" },
                { label: "合规说明", href: "/compliance" },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
