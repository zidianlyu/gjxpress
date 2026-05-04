'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { ExceptionCase } from '@/lib/api/admin';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { ExceptionStatusBadge } from '@/components/common/StatusBadge';

// Mock data
const mockExceptions: ExceptionCase[] = [
  {
    id: 'exc_001',
    type: 'DAMAGED',
    status: 'OPEN',
    description: '外包装破损，请检查内部物品是否完好',
    orderNo: 'ORD-202604-0001',
    packageNo: 'PKG-0001',
    userCode: '1023',
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'exc_002',
    type: 'MISSING_ITEM',
    status: 'PROCESSING',
    description: '订单显示3件商品，但包裹中只有2件',
    orderNo: 'ORD-202604-0002',
    packageNo: 'PKG-0003',
    userCode: '1024',
    createdAt: '2026-04-02T14:30:00Z',
  },
];

const typeLabels: Record<string, string> = {
  MISSING_ITEM: '少件',
  WRONG_ITEM: '错货',
  DAMAGED: '破损',
  RESTRICTED: '禁运品',
  OTHER: '其他',
};

export default function AdminExceptionsPage() {
  const [exceptions, setExceptions] = useState<ExceptionCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchExceptions = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setExceptions(mockExceptions);
      } catch {
        setError('加载异常数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExceptions();
  }, []);

  const filteredExceptions = exceptions.filter((exc) => {
    const matchesSearch =
      searchQuery === '' ||
      exc.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exc.userCode.includes(searchQuery);
    const matchesStatus = statusFilter === '' || exc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingState fullPage message="加载异常数据..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold">异常处理</h1>
          <p className="text-muted-foreground">查看和处理用户提交的异常情况</p>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索订单号、用户码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border bg-background px-3 py-2"
            >
              <option value="">所有状态</option>
              <option value="OPEN">待处理</option>
              <option value="PROCESSING">处理中</option>
              <option value="RESOLVED">已解决</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exceptions Table */}
      <div className="p-6">
        {filteredExceptions.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">异常类型</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">订单号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">包裹号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">用户码</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">描述</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">创建时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredExceptions.map((exc) => (
                  <tr key={exc.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {typeLabels[exc.type] || exc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{exc.orderNo}</td>
                    <td className="px-4 py-3 text-sm">{exc.packageNo}</td>
                    <td className="px-4 py-3 text-sm">{exc.userCode}</td>
                    <td className="px-4 py-3 text-sm">
                      <ExceptionStatusBadge status={exc.status} />
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {exc.description}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(exc.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/admin/exceptions/${exc.id}`}
                        className="text-primary hover:underline"
                      >
                        处理
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="暂无异常"
            description="没有找到符合条件的异常记录"
            icon="inbox"
          />
        )}

        {filteredExceptions.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              显示 {filteredExceptions.length} 条结果
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled
                className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
