'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Eye, Search } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { TransactionRecord } from '@/types/admin';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { centsToYuanText } from '@/lib/admin/payment-order';
import { formatShipmentType } from '@/lib/shipment-types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatTransactionDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('zh-CN');
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getTransactions({
        q: search || undefined,
        page,
        pageSize: 20,
      });
      setTransactions(data?.items || []);
      setTotalPages(data?.totalPages || data?.pagination?.totalPages || 1);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrorRequestId(err.requestId || '');
      } else {
        setError('加载失败');
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">支付订单</h1>
          <p className="text-sm text-muted-foreground">管理客户运费与退款记录</p>
        </div>
      </header>

      <div className="p-4 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索客户编号、集运单号..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-md border bg-background text-sm hover:bg-muted">搜索</button>
        </form>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            <p>{error}</p>
            {errorRequestId && <p className="mt-1 text-xs break-all">Request ID: {errorRequestId}</p>}
            <button onClick={fetchData} className="mt-2 text-xs underline">重试</button>
          </div>
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <EmptyState title="暂无支付订单" description="未支付集运单可从客户集运单列表发起订单" />
        )}

        {!isLoading && !error && transactions.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">创建时间</th>
                    <th className="text-left px-4 py-3 font-medium">集运单号</th>
                    <th className="text-left px-4 py-3 font-medium">客户编号</th>
                    <th className="text-left px-4 py-3 font-medium">运输类型</th>
                    <th className="text-left px-4 py-3 font-medium">金额</th>
                    <th className="text-left px-4 py-3 font-medium">备注</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatTransactionDate(t.createdAt)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.customerShipment?.shipmentNo || '未生成'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.customer?.customerCode || t.customerShipment?.customer?.customerCode || '-'}</td>
                      <td className="px-4 py-3">{formatShipmentType(t.customerShipment?.shipmentType)}</td>
                      <td className="px-4 py-3 font-mono">{centsToYuanText(t.amountCents)}</td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[150px]">{t.adminNote || '-'}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/transactions/${t.id}`} className="text-primary hover:underline text-xs inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" /> 查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {transactions.map((t) => (
                <Link key={t.id} href={`/admin/transactions/${t.id}`} className="block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{formatShipmentType(t.customerShipment?.shipmentType)}</span>
                    <span className="font-mono font-semibold text-sm">{centsToYuanText(t.amountCents)}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">客户：{t.customer?.customerCode || t.customerShipment?.customer?.customerCode || '-'}</span>
                      <span className="text-xs text-muted-foreground">{formatTransactionDate(t.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">集运单号：{t.customerShipment?.shipmentNo || '未生成'}</p>
                    {t.adminNote && <p className="text-muted-foreground text-xs truncate">{t.adminNote}</p>}
                  </div>
                </Link>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
          </>
        )}
      </div>
    </div>
  );
}
