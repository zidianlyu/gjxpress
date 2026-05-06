import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Package, Plane, Ship, Camera, Scale, CheckCircle, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: '中美跨境物流服务｜广骏国际快运',
  description: '了解广骏国际快运的中美跨境物流流程：国内仓收货、入库拍照、合箱整理、空运/海运出库与物流状态查询。',
  alternates: {
    canonical: '/services/china-us-shipping',
  },
};

const features = [
  {
    icon: Camera,
    title: '入库拍照',
    description: '每个包裹到达国内仓后进行拍照记录，便于后续核对',
  },
  {
    icon: Scale,
    title: '称重记录',
    description: '记录实际重量和体积重量，取较大值作为计费重量',
  },
  {
    icon: Package,
    title: '合箱整理',
    description: '多个包裹可以合箱整理后一起出库',
  },
  {
    icon: CheckCircle,
    title: '状态可查',
    description: '物流状态在系统中记录更新，支持自助查询',
  },
];

const whoIsFor = [
  '在美国生活的华人',
  '需要从国内电商平台购物的用户',
  '需要将国内购买的商品运到美国的用户',
  '需要邮寄个人物品到美国的用户',
  '小型跨境电商卖家',
];

const workflowSteps = [
  { title: '注册获取客户编号', description: '提交注册信息，获取专属客户编号' },
  { title: '电商平台下单', description: '将商品寄到国内仓，备注客户编号' },
  { title: '包裹入库拍照', description: '仓库收货后拍照、称重、入库' },
  { title: '整理与合箱出库', description: '工作人员协助整理打包并安排出库' },
  { title: '国际运输', description: '安排空运或海运，物流状态在系统中记录' },
  { title: '美国段取货', description: '到达美国后根据通知安排取货' },
];

export default function ChinaUsShippingPage() {
  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">适合哪些用户</h2>
            <div className="flex items-start gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">
                服务面向在美国生活的华人用户，协助将国内购买的商品转运到美国。
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                    时效相对更快，支持物流状态查询。适合小件商品和对时效有一定要求的包裹。
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
                    适合大件重货，费用参考价相对更低。适合大件商品和对时效要求不高的包裹。
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">服务特点</h2>
            <p className="text-muted-foreground mb-8">
              通过入库拍照、称重记录、物流状态查询，帮助客户清楚了解包裹处理进度。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">拍照</div>
                <p className="text-sm text-muted-foreground">包裹入库拍照记录</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">称重</div>
                <p className="text-sm text-muted-foreground">计费重量记录</p>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-primary mb-2">查询</div>
                <p className="text-sm text-muted-foreground">物流状态自助查询</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
