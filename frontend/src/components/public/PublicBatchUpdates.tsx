'use client';

import { useEffect, useState } from 'react';
import { Loader2, Truck } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import { MASTER_SHIPMENT_STATUS_LABELS } from '@/lib/constants/status';
import type { PublicBatchUpdate } from '@/types/public';

export function PublicBatchUpdates() {
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
    <section className="rounded-lg border bg-card p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">当前批次更新说明</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            这里展示已公开的国际批次低敏状态。批次信息用于辅助了解线路进度，具体包裹状态请在下方输入单号查询。
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && updates.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Truck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">暂无公开批次更新</p>
        </div>
      )}

      {!isLoading && updates.length > 0 && (
        <div className="space-y-4">
          {updates.map((update) => (
            <article key={update.batchNo} className="rounded-lg border bg-background p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="break-all font-mono text-sm font-medium">{update.batchNo}</span>
                <span className="w-fit rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                  {MASTER_SHIPMENT_STATUS_LABELS[update.status] || update.statusText || update.status}
                </span>
              </div>
              {update.publicTitle && <p className="mt-3 font-medium">{update.publicTitle}</p>}
              {update.publicSummary && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{update.publicSummary}</p>
              )}
              {update.publicStatusText && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{update.publicStatusText}</p>
              )}
              {update.publishedAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                  发布于 {new Date(update.publishedAt).toLocaleDateString('zh-CN')}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
