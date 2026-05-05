import type { Metadata } from 'next';
import { Lock } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: '隐私政策',
  description: `${SITE_CONFIG.brandDisplayName}隐私政策，了解我们如何保护您的信息。`,
};

export default function PrivacyPage() {
  return (
    <div className="container px-4 md:px-6 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">隐私政策</h1>
          <p className="mt-2 text-muted-foreground">最后更新：2025年5月</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">信息收集</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              我们在提供服务过程中可能收集以下信息：
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>客户手机号码（用于账户识别与服务通知）</li>
              <li>包裹快递单号（用于入库识别与状态跟踪）</li>
              <li>包裹重量与尺寸信息（用于运费计算）</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">信息使用</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              收集的信息仅用于以下目的：
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>提供物流状态查询服务</li>
              <li>管理客户包裹与集运单</li>
              <li>通知客户包裹状态变更</li>
              <li>处理服务相关的费用记录</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">信息保护</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              我们采取合理的技术和组织措施保护您的个人信息安全：
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>公开查询接口不暴露任何个人身份信息（PII）</li>
              <li>管理系统采用JWT令牌认证，未授权不可访问</li>
              <li>数据传输使用HTTPS加密</li>
              <li>敏感信息（如密码）使用bcrypt加密存储</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">信息共享</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              我们不会将您的个人信息出售给第三方。仅在以下情况下可能共享信息：
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>与承运物流供应商共享必要的包裹信息以完成运输</li>
              <li>法律要求或政府机关依法要求提供</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-3">联系我们</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              如对隐私政策有疑问，请通过微信联系我们。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
