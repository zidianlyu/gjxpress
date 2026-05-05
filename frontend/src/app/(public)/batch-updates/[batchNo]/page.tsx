'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Truck } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import type { PublicBatchUpdate } from '@/types/public';
import { MASTER_SHIPMENT_STATUS_LABELS } from '@/lib/constants/status';

export default function BatchUpdateDetailPage() {
  const params = useParams();
  const batchNo = params.batchNo as string;
  const [data, setData] = useState<PublicBatchUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!batchNo) return;
    const fetchData = async () => {
      try {
        const response = await publicApi.getBatchUpdateByBatchNo(batchNo);
        setData(response.data);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setError('未找到该批次信息');
          } else {
            setError(err.message);
          }
        } else {
          setError('加载失败');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [batchNo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 md:px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/batch-updates" className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回批次列表
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container px-4 md:px-6 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <Link href="/batch-updates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          返回批次列表
        </Link>

        <div className="p-6 rounded-lg border bg-card">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">{data.batchNo}</h1>
          </div>

          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">状态</dt>
              <dd className="font-medium">
                {MASTER_SHIPMENT_STATUS_LABELS[data.status] || data.statusText || data.status}
              </dd>
            </div>
            {data.publicTitle && (
              <div className="pt-3 border-t">
                <dt className="text-muted-foreground text-sm mb-1">标题</dt>
                <dd className="font-medium">{data.publicTitle}</dd>
              </div>
            )}
            {data.publicSummary && (
              <div className="pt-3 border-t">
                <dt className="text-muted-foreground text-sm mb-1">摘要</dt>
                <dd className="text-sm">{data.publicSummary}</dd>
              </div>
            )}
            {data.publicStatusText && (
              <div className="pt-3 border-t">
                <dt className="text-muted-foreground text-sm mb-1">详细状态</dt>
                <dd className="text-sm">{data.publicStatusText}</dd>
              </div>
            )}
            {data.publishedAt && (
              <div className="pt-3 border-t flex justify-between">
                <dt className="text-muted-foreground">发布时间</dt>
                <dd className="text-sm">{new Date(data.publishedAt).toLocaleString('zh-CN')}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
