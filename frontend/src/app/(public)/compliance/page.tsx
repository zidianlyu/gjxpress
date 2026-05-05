import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '合规说明',
  description: `${SITE_CONFIG.brandDisplayName}合规说明，了解我们的合规经营原则。`,
};

export default function CompliancePage() {
  return (
    <div className="container px-4 md:px-6 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">合规说明</h1>
          <p className="mt-2 text-muted-foreground">
            {SITE_CONFIG.name}合规经营原则
          </p>
        </div>

        <div className="prose prose-gray mx-auto space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">服务定位</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {SITE_CONFIG.name}提供的是跨境供应链物流信息管理服务，包括包裹入库记录、集运单状态跟踪与海外仓取件管理。
              我们不提供进出口报关、通关、保税、代购、代付或外汇兑换等服务。
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">禁运物品</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              我们严格遵守中国及美国相关法律法规，不接受任何法律禁止运输的物品，包括但不限于：
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>危险品、易燃易爆物品</li>
              <li>毒品及管制药品</li>
              <li>枪支弹药及管制刀具</li>
              <li>假冒伪劣商品</li>
              <li>动植物及其制品（需检疫类）</li>
              <li>国家法律法规禁止出境的其他物品</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">数据与隐私</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              我们重视用户数据安全与隐私保护。公开查询接口不暴露任何个人身份信息（PII），
              仅展示物流状态相关信息。详细隐私保护策略请参阅我们的隐私政策页面。
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">知识产权</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              本网站内容受著作权保护。未经授权，不得复制、转载或以其他方式使用本网站的任何内容。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
