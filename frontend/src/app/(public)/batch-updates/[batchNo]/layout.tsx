import type { Metadata } from 'next';

interface BatchUpdateLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    batchNo: string;
  }>;
}

export async function generateMetadata({
  params,
}: BatchUpdateLayoutProps): Promise<Metadata> {
  const { batchNo } = await params;
  
  return {
    title: `批次 ${batchNo} 详情｜广骏国际快运`,
    description: `查看批次 ${batchNo} 的详细运输状态更新信息。`,
    alternates: {
      canonical: `/batch-updates/${batchNo}`,
    },
  };
}

export default function BatchUpdateLayout({ children }: BatchUpdateLayoutProps) {
  return children;
}
