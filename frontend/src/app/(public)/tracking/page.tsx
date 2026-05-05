'use client';

import { useState } from 'react';
import { Search, Loader2, Package } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import type { PublicTrackingResult } from '@/types/public';

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
    <div className="container px-4 md:px-6 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">物流状态查询</h1>
          <p className="mt-2 text-muted-foreground">
            输入集运单号（如 GJS20260504123），查询当前物流状态
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="请输入集运单号"
            className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">查询结果</h2>
            </div>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">查询单号</dt>
                <dd className="font-medium">{result.query}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">当前状态</dt>
                <dd className="font-medium">{result.statusText}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">阶段</dt>
                <dd className="font-medium">{result.stage}</dd>
              </div>
              {result.lastUpdatedAt && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">最后更新</dt>
                  <dd className="font-medium">
                    {new Date(result.lastUpdatedAt).toLocaleString('zh-CN')}
                  </dd>
                </div>
              )}
              {result.message && (
                <div className="pt-3 border-t">
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
        <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700">
          <p className="font-medium mb-1">查询说明</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>查询结果仅显示物流状态信息，不包含个人隐私信息</li>
            <li>如查询无结果，可能为单号输入有误或尚未录入系统</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
