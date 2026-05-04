'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { ExceptionCase } from '@/lib/api/admin';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { ExceptionStatusBadge } from '@/components/common/StatusBadge';

// Mock data
const mockException: ExceptionCase & { resolutionNote?: string } = {
  id: 'exc_001',
  type: 'DAMAGED',
  status: 'OPEN',
  description: '外包装破损，请检查内部物品是否完好。快递运输过程中造成的破损，外包装有明显挤压痕迹。',
  orderNo: 'ORD-202604-0001',
  packageNo: 'PKG-0001',
  userCode: '1023',
  createdAt: '2026-04-01T10:00:00Z',
};

const typeLabels: Record<string, string> = {
  MISSING_ITEM: '少件',
  WRONG_ITEM: '错货',
  DAMAGED: '破损',
  RESTRICTED: '禁运品',
  OTHER: '其他',
};

export default function ExceptionDetailPage() {
  const params = useParams();
  const exceptionId = params.id as string;

  const [exception, setException] = useState<(ExceptionCase & { resolutionNote?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');

  useEffect(() => {
    const fetchException = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setException(mockException);
      } catch {
        setError('加载异常详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchException();
  }, [exceptionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setException((prev) =>
        prev
          ? { ...prev, status: newStatus, resolutionNote }
          : null
      );
    } catch {
      setError('处理失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState fullPage message="加载异常详情..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!exception) {
    return <ErrorState message="异常记录不存在" />;
  }

  const isResolved = exception.status === 'RESOLVED';

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <Link
          href="/admin/exceptions"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回异常列表
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">异常处理</h1>
            <p className="text-muted-foreground">{exception.orderNo}</p>
          </div>
          <ExceptionStatusBadge status={exception.status} />
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-3xl">
          {/* Exception Info */}
          <div className="p-6 rounded-lg border bg-card mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">异常类型</p>
                <p className="text-lg font-semibold">{typeLabels[exception.type] || exception.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">订单号</p>
                <p className="font-medium">{exception.orderNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">包裹号</p>
                <p className="font-medium">{exception.packageNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">用户码</p>
                <p className="font-medium">{exception.userCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">创建时间</p>
                <p className="font-medium">
                  {new Date(exception.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">问题描述</p>
              <p className="p-4 rounded-md bg-muted/50">{exception.description}</p>
            </div>
          </div>

          {/* Resolution Form */}
          {!isResolved && (
            <form onSubmit={handleSubmit} className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-4">处理异常</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">处理状态</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  >
                    <option value="PROCESSING">处理中</option>
                    <option value="RESOLVED">已解决</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">处理备注</label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows={4}
                    placeholder="请输入处理过程和结果说明..."
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    '确认处理'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Resolution Info (if resolved) */}
          {isResolved && (
            <div className="p-6 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-900">已解决</h3>
              </div>
              {exception.resolutionNote && (
                <div>
                  <p className="text-sm text-green-700 mb-2">处理备注</p>
                  <p className="text-green-800">{exception.resolutionNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
