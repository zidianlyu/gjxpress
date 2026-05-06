import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = buildMetadata({
  title: '批次更新｜广骏国际快运',
  description: '查看广骏国际快运公开发布的批次状态更新，了解已公开的低敏物流进度信息。',
  path: '/batch-updates',
});

export default function BatchUpdatesLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '批次更新', path: '/batch-updates' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      {children}
    </>
  );
}
