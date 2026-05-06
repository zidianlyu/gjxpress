import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = buildMetadata({
  title: '新客户注册｜广骏国际快运',
  description: '填写新客户联系信息，提交后生成客户编号，工作人员审核通过后用于后续包裹归属。',
  path: '/register',
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbData = buildBreadcrumbJsonLd([
    { name: '首页', path: '/' },
    { name: '新客户注册', path: '/register' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />
      {children}
    </>
  );
}
