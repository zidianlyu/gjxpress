import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Package, Plane, Ship, Camera, Scale, CheckCircle, Users } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '中美跨境物流服务',
  description: `了解${SITE_CONFIG.brandDisplayName}的中美跨境物流流程：国内仓收货、入库拍照、用户确认、空运/海运发货与物流查询。`,
};

const features = [
  {
    icon: Camera,
    title: '入库拍照',
    description: '每个包裹到达国内仓后，我们会拍摄外包装、面单和内部物品照片',
  },
  {
    icon: Scale,
    title: '精准称重',
    description: '记录实际重量和体积重量，取较大者计费，费用透明',
  },
  {
    icon: Package,
    title: '包裹合单',
    description: '多个包裹可以合并发货，节省运费',
  },
  {
    icon: CheckCircle,
    title: '全程追踪',
    description: '从入库到收货，全程可查物流状态',
  },
];

const whoIsFor = [
  '在美国生活的华人',
  '需要从国内电商平台购物的用户',
  '希望享受国内价格优势的消费者',
  '需要邮寄个人物品到美国的用户',
  '小型跨境电商卖家',
];

const workflowSteps = [
  { title: '获取仓库地址', description: '在小程序中获取您的专属国内仓地址' },
  { title: '电商平台下单', description: '将商品寄到国内仓，备注您的用户ID' },
  { title: '包裹入库拍照', description: '仓库收货后拍照、称重、入库' },
  { title: '用户确认', description: '在小程序查看照片并确认包裹' },
  { title: '国际发货', description: '确认后安排空运或海运' },
  { title: '物流追踪', description: '全程追踪直至收货确认' },
];

export default function ChinaUsShippingPage() {
  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight">中美跨境物流服务</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              专业的中国到美国包裹转运服务，看得见每一步
            </p>
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">适合哪些用户</h2>
            <div className="flex items-start gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                我们的服务面向在美国生活的华人用户，帮助您将国内购买的商品安全、便捷地运送到美国。
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whoIsFor.map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">服务特色</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">服务流程</h2>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="flex flex-col p-6 rounded-lg border bg-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">运输方式选择</h2>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link href="/services/air-freight" className="group">
                <div className="h-full p-8 rounded-lg border bg-card transition-colors hover:border-primary/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                    <Plane className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">空运服务</h3>
                  <p className="text-muted-foreground mb-4">
                    适合紧急包裹，时效更快，全程可追踪。推荐用于小件、贵重或急需的物品。
                  </p>
                  <span className="inline-flex items-center text-primary group-hover:underline">
                    了解空运详情 <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>
              <Link href="/services/sea-freight" className="group">
                <div className="h-full p-8 rounded-lg border bg-card transition-colors hover:border-primary/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
                    <Ship className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">海运服务</h3>
                  <p className="text-muted-foreground mb-4">
                    适合大件重货，经济实惠。推荐用于大件商品、批量采购等不急需的物品。
                  </p>
                  <span className="inline-flex items-center text-primary group-hover:underline">
                    了解海运详情 <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">为什么选择我们</h2>
            <p className="text-muted-foreground mb-8">
              我们相信，透明的物流体验才能建立信任。通过入库拍照、精准称重、全程追踪，
              让您随时掌握包裹状态，安心等待收货。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">包裹入库拍照</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">透明</div>
                <p className="text-sm text-muted-foreground">计费重量计算</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">全程</div>
                <p className="text-sm text-muted-foreground">物流状态追踪</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">准备开始了吗？</h2>
            <p className="mt-4 text-muted-foreground">
              了解更多详情或咨询客服
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
