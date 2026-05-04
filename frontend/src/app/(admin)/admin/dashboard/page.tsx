'use client';

import { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  DollarSign,
  Truck,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { adminApi, DashboardSummary } from '@/lib/api/admin';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

const metricIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  todayInboundCount: Package,
  pendingUserConfirmCount: Clock,
  pendingPaymentCount: DollarSign,
  readyToShipCount: Truck,
  shippedTodayCount: CheckCircle,
  openExceptionCount: AlertTriangle,
};

const metricLabels: Record<string, string> = {
  todayInboundCount: '今日入库',
  pendingUserConfirmCount: '待用户确认',
  pendingPaymentCount: '待支付',
  readyToShipCount: '待发货',
  shippedTodayCount: '今日已发货',
  openExceptionCount: '异常件',
};

const metricColors: Record<string, string> = {
  todayInboundCount: 'bg-blue-100 text-blue-600',
  pendingUserConfirmCount: 'bg-yellow-100 text-yellow-600',
  pendingPaymentCount: 'bg-red-100 text-red-600',
  readyToShipCount: 'bg-cyan-100 text-cyan-600',
  shippedTodayCount: 'bg-green-100 text-green-600',
  openExceptionCount: 'bg-rose-100 text-rose-600',
};

// Mock data for demonstration
const mockData: DashboardSummary = {
  todayInboundCount: 12,
  pendingUserConfirmCount: 8,
  pendingPaymentCount: 5,
  readyToShipCount: 3,
  shippedTodayCount: 15,
  openExceptionCount: 2,
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For demonstration, use mock data
        // In production: const response = await adminApi.getDashboardSummary();
        // setData(response.data);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
        setData(mockData);
      } catch (err) {
        setError('加载数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState fullPage message="加载数据中..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!data) {
    return <ErrorState message="暂无数据" />;
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">管理概览</h1>
        <p className="text-muted-foreground">今日运营数据一览</p>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(data).map(([key, value]) => {
            const Icon = metricIcons[key];
            const colorClass = metricColors[key];

            return (
              <div
                key={key}
                className="p-6 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colorClass}`}>
                    {Icon && <Icon className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{metricLabels[key]}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold mb-4">快捷操作</h3>
            <div className="space-y-2">
              <a
                href="/admin/packages/inbound"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <Package className="h-5 w-5 text-primary" />
                <span>新增入库</span>
              </a>
              <a
                href="/admin/orders"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <Clock className="h-5 w-5 text-yellow-500" />
                <span>查看待确认订单</span>
              </a>
              <a
                href="/admin/exceptions"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
              >
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>处理异常件</span>
              </a>
            </div>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold mb-4">系统状态</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API 服务</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">数据库</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">存储服务</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  正常
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
