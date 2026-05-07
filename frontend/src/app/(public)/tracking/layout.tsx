import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = buildMetadata({
  title: '查询订单与批次更新｜广骏国际快运',
  description: '通过客户编号或物流信息查询订单状态，并查看广骏国际快运中国到美国线路的批次更新说明。',
  path: '/tracking',
});

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '查询订单', path: '/tracking' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      {children}
    </>
  );
}
