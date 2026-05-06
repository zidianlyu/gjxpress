import type { Metadata } from 'next';
import { Package, Eye, Heart, Globe } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '关于我们｜广骏国际快运',
  description: '了解广骏国际快运的品牌故事、服务理念与核心价值。',
  alternates: {
    canonical: '/about',
  },
};

const values = [
  {
    icon: Eye,
    title: '透明可信',
    description: '入库拍照、物流状态记录，让物流看得见',
  },
  {
    icon: Heart,
    title: '客户至上',
    description: '以客户需求为中心，提供优质服务',
  },
  {
    icon: Globe,
    title: '连接中美',
    description: '为在美华人提供便捷的跨境物流桥梁',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mx-auto mb-6">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">关于 {SITE_CONFIG.brandDisplayName}</h1>
            <p className="mt-4 text-xl text-primary font-medium">{SITE_CONFIG.slogan}</p>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">品牌故事</h2>
            <div className="prose prose-gray mx-auto">
              <p className="text-muted-foreground leading-relaxed">
                {SITE_CONFIG.brandDisplayName}（{SITE_CONFIG.name}）专注于为在美国生活的华人提供跨境供应链与物流信息服务。
                我们深知海外华人对于国内商品的需求，以及在跨境购物中面临的种种不便。
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                基于&quot;看得见的跨境物流&quot;这一理念，我们建立了透明的物流服务体系：
                每个包裹入库时进行拍照记录，便于后续核对；
                称重和计费重量记录清晰；
                物流状态在系统中记录更新，支持自助查询。
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                我们提供的服务包括仓储入库、包裹确认、发货管理与物流查询，
                致力于建立中美之间便捷、透明、可信赖的物流桥梁。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">核心价值</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="flex flex-col items-center text-center p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Philosophy */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">服务理念</h2>
            <div className="space-y-8">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">建立信任</h3>
                <p className="text-muted-foreground text-sm">
                  通过入库拍照、面单照片、货物照片和用户确认机制，让客户看得见每一步，
                  建立起客户与我们之间的信任。
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">提高效率</h3>
                <p className="text-muted-foreground text-sm">
                  通过标准化的入库、整理、出库和异常处理流程，
                  减少沟通成本，提高服务效率。
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">提供性价比</h3>
                <p className="text-muted-foreground text-sm">
                  通过计费重量记录和合箱整理服务，
                  帮助客户了解费用构成，费用参考以实际打包和工作人员确认为准。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Scope */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-4">服务范围说明</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {SITE_CONFIG.name}提供跨境供应链与物流信息服务，支持仓储入库、包裹状态管理、
                集运单跟踪与国际批次状态查询。我们致力于为用户提供便捷、透明的物流信息服务体验。
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
