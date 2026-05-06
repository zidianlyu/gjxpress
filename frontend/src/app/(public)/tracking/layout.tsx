import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = buildMetadata({
  title: '物流状态查询｜广骏国际快运',
  description: '通过国内快递单号或集运单号查询低敏物流状态。公开查询仅展示状态信息，不展示手机号、微信号、图片或交易记录。',
  path: '/tracking',
});

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '物流状态查询', path: '/tracking' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      {children}
    </>
  );
}
