import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '服务条款',
  description: `${SITE_CONFIG.brandDisplayName}服务条款。`,
};

export default function TermsPage() {
  return (
    <div className="container px-4 md:px-6 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">服务条款</h1>
          <p className="mt-2 text-muted-foreground">最后更新：2025年5月</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">服务范围</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {SITE_CONFIG.name}提供跨境供应链与物流信息管理服务，包括但不限于：
              包裹入库记录、集运单状态跟踪、国际批次运输状态查询与海外仓取件管理。
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">用户责任</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>用户应确保提供的包裹信息真实准确</li>
              <li>用户不得利用本服务运输任何违禁物品</li>
              <li>用户应妥善保管账户凭证，因用户自身原因导致的安全问题由用户自行承担</li>
              <li>用户应遵守中国及美国相关法律法规</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">服务限制</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>我们不保证物流时效，实际运输时间受承运商和海关等因素影响</li>
              <li>我们不提供进出口报关、通关、保税或代购等服务</li>
              <li>因不可抗力（自然灾害、政策变更等）导致的服务中断，我们不承担责任</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">费用与结算</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              服务相关费用以系统中记录的交易明细为准。费用产生后将在客户账户中生成对应的交易记录，
              客户可在管理系统中查看。具体费用标准请咨询客服了解。
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">条款变更</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              我们保留随时修改服务条款的权利。修改后的条款将在网站上公布。
              继续使用本服务即表示您同意修改后的条款。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
