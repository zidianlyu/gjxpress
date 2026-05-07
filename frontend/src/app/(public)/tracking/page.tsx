'use client';

import { useState } from 'react';
import { Search, Loader2, Package } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import type { PublicTrackingResult } from '@/types/public';
import { PublicBatchUpdates } from '@/components/public/PublicBatchUpdates';

export default function TrackingPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<PublicTrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError('');
    setResult(null);
    setSearched(true);

    try {
      const response = await publicApi.tracking(trimmed);
      setResult(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('未找到相关物流信息，请检查单号后重试');
        } else {
          setError(err.message);
        }
      } else {
        setError('查询失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">查询订单与批次更新</h1>
          <p className="mt-2 text-muted-foreground">
            查看公开批次更新，并输入客户编号、国内快递单号或集运单号查询当前物流状态。
          </p>
        </div>

        <PublicBatchUpdates />

        <section className="mt-8 rounded-lg border bg-card p-5 shadow-sm md:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">查询订单状态</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              查询结果仅显示低敏物流状态信息，不展示手机号、微信号、国内退货地址、包裹图片、交易记录或管理员备注。
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="请输入客户编号、国内快递单号或集运单号"
              className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </form>

          {/* Results */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 rounded-lg border bg-background p-6">
              <div className="mb-4 flex items-center gap-3">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">查询结果</h2>
              </div>
              <dl className="space-y-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <dt className="text-muted-foreground">查询单号</dt>
                  <dd className="break-all font-medium">{result.query}</dd>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <dt className="text-muted-foreground">当前状态</dt>
                  <dd className="font-medium">{result.statusText}</dd>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <dt className="text-muted-foreground">阶段</dt>
                  <dd className="font-medium">{result.stage}</dd>
                </div>
                {result.lastUpdatedAt && (
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <dt className="text-muted-foreground">最后更新</dt>
                    <dd className="font-medium">
                      {new Date(result.lastUpdatedAt).toLocaleString('zh-CN')}
                    </dd>
                  </div>
                )}
                {result.message && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                )}
              </dl>
            </div>
          )}

          {searched && !isLoading && !result && !error && (
            <div className="mt-6 text-center text-muted-foreground">
              <p>未找到相关记录</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <p className="mb-1 font-medium">查询说明</p>
            <ul className="list-inside list-disc space-y-1 text-blue-600">
              <li>查询结果仅显示物流状态信息，不包含个人隐私信息</li>
              <li>如查询无结果，可能为单号输入有误或尚未录入系统</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
