import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '批次更新｜广骏国际快运',
  description: '查看公开的国际批次运输状态更新，了解批次运输进度。',
};

export default function BatchUpdatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
