'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, Loader2 } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import type { PublicBatchUpdate } from '@/types/public';
import { MASTER_SHIPMENT_STATUS_LABELS } from '@/lib/constants/status';

export default function BatchUpdatesPage() {
  const [updates, setUpdates] = useState<PublicBatchUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await publicApi.getBatchUpdates({ page: 1, pageSize: 20 });
        setUpdates(response.data?.items || []);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('加载失败，请稍后重试');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container px-4 md:px-6 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">批次更新</h1>
          <p className="mt-2 text-muted-foreground">
            查看公开的国际批次运输状态更新
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!isLoading && !error && updates.length === 0 && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">暂无公开批次更新</p>
          </div>
        )}

        {!isLoading && updates.length > 0 && (
          <div className="space-y-4">
            {updates.map((update) => (
              <Link
                key={update.batchNo}
                href={`/batch-updates/${update.batchNo}`}
                className="block p-5 rounded-lg border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-medium">{update.batchNo}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {MASTER_SHIPMENT_STATUS_LABELS[update.status] || update.statusText || update.status}
                  </span>
                </div>
                {update.publicTitle && (
                  <p className="font-medium mb-1">{update.publicTitle}</p>
                )}
                {update.publicSummary && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{update.publicSummary}</p>
                )}
                {update.publishedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    发布于 {new Date(update.publishedAt).toLocaleDateString('zh-CN')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
