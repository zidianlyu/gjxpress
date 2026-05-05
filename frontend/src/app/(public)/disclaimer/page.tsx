import type { Metadata } from 'next';
import { AlertCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '免责声明',
  description: `${SITE_CONFIG.brandDisplayName}免责声明。`,
};

export default function DisclaimerPage() {
  return (
    <div className="container px-4 md:px-6 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">免责声明</h1>
          <p className="mt-2 text-muted-foreground">最后更新：2025年5月</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">服务性质</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {SITE_CONFIG.name}提供物流信息管理与状态查询服务。我们不直接从事货物运输，
              实际运输由第三方承运商完成。我们对承运商的运输行为和服务质量不承担连带责任。
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">信息准确性</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              虽然我们尽力确保系统中物流状态信息的准确性和时效性，但因信息来源于多方系统，
              我们不保证所有信息在任何时刻都是100%准确的。如发现信息不一致，请联系客服核实。
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">货物风险</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              包裹在运输过程中可能面临损坏、丢失或延误的风险。我们建议客户：
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>避免运输高价值物品时不购买保险</li>
              <li>确保物品包装完好</li>
              <li>在入库确认阶段仔细核对包裹信息</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">责任限制</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              在法律允许的最大范围内，{SITE_CONFIG.name}对因使用或无法使用本服务而导致的任何间接、
              附带、特殊、后果性或惩罚性损害不承担责任。
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">联系方式</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如有任何疑问或需要帮助，请通过微信联系我们的客服团队。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
