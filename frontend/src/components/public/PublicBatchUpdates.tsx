'use client';

import { useEffect, useState } from 'react';
import { Loader2, Truck } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import type { PublicBatchUpdate } from '@/types/public';
import {
  formatMasterShipmentStatus,
  formatMasterShipmentType,
  formatMasterShipmentVendor,
  formatPublicDateTime,
} from '@/lib/public-tracking';

export function PublicBatchUpdates() {
  const [updates, setUpdates] = useState<PublicBatchUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await publicApi.getBatchUpdates({ limit: 10 });
        setUpdates(data);
      } catch {
        setError('批次更新暂时无法加载，请稍后重试。');
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
          <p className="text-sm text-muted-foreground">暂时还没有公开批次更新，请稍后查看或联系工作人员确认。</p>
        </div>
      )}

      {!isLoading && updates.length > 0 && (
        <div className="space-y-4">
          {updates.map((update, index) => (
            <article key={`${update.vendorTrackingNo || update.batchNo || 'batch'}-${index}`} className="rounded-lg border bg-background p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium">{formatMasterShipmentType(update.shipmentType)}</span>
                <span className="w-fit rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                  {update.status ? formatMasterShipmentStatus(update.status) : update.statusText || '-'}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">供应商</dt>
                  <dd className="font-medium">{formatMasterShipmentVendor(update.vendorName)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">供应商单号</dt>
                  <dd className="break-all font-mono text-xs">{update.vendorTrackingNo || update.batchNo || '-'}</dd>
                </div>
                {typeof update.customerShipmentCount === 'number' && (
                  <div>
                    <dt className="text-xs text-muted-foreground">集运单数量</dt>
                    <dd className="font-medium">{update.customerShipmentCount}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground">更新时间</dt>
                  <dd className="font-medium">{formatPublicDateTime(update.updatedAt || update.createdAt || update.publishedAt)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
