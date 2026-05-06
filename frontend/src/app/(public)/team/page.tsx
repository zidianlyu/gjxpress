import type { Metadata } from 'next';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
  title: '团队介绍｜广骏国际快运',
  description: '了解广骏国际快运的服务团队与分工，包括国内仓储、海外仓管理和系统客服团队。',
  alternates: {
    canonical: '/team',
  },
};

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">团队介绍</h1>
          <p className="mt-2 text-muted-foreground">
            专业的供应链服务团队，协同高效
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-2">国内仓储团队</h2>
            <p className="text-sm text-muted-foreground">
              负责包裹入库、拍照记录、称重量测、合箱打包等操作。确保每件包裹入库信息准确。
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-2">海外仓管理团队</h2>
            <p className="text-sm text-muted-foreground">
              负责国际批次到达后的签收、拆分、通知与取件状态管理。
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h2 className="text-lg font-semibold mb-2">系统与客服团队</h2>
            <p className="text-sm text-muted-foreground">
              负责系统开发维护、客户问题处理、异常协调与服务体验优化。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
