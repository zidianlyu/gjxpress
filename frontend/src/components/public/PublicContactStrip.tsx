import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export function PublicContactStrip() {
  return (
    <section className="border-t bg-background py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-medium">有问题想先确认？</p>
              <p className="mt-1 text-muted-foreground">
                欢迎联系工作人员咨询中国到美国线路、入库、合箱和美国段交接安排。
              </p>
              <p className="mt-2 break-all text-muted-foreground">
                国内微信：{siteConfig.publicContacts.domestic.wechat}；美国微信：{siteConfig.publicContacts.us.wechat}
              </p>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            联系页面
          </Link>
        </div>
      </div>
    </section>
  );
}
