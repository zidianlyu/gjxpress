import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '新客户注册｜广骏国际快运',
  description: '填写新客户联系信息，提交后生成客户编号，工作人员审核通过后用于后续包裹归属。',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
