import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '物流状态查询｜广骏国际快运',
  description: '输入集运单号查询包裹当前物流状态，结果仅显示物流信息，不包含个人隐私信息。',
};

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
