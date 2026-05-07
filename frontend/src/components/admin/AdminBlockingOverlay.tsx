'use client';

import { Loader2 } from 'lucide-react';

type AdminBlockingOverlayProps = {
  title?: string;
  description?: string;
};

export function AdminBlockingOverlay({
  title = '正在提交，请稍候',
  description = '正在创建记录...',
}: AdminBlockingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      aria-busy="true"
      role="status"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
