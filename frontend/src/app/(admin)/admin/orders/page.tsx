'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi, Order } from '@/lib/api/admin';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/common/StatusBadge';

// Mock data
const mockOrders: Order[] = [
  {
    id: 'ord_001',
    orderNo: 'ORD-202604-0001',
    userId: 'usr_001',
    user: { id: 'usr_001', userCode: '1023', nickname: '张三' },
    status: 'PAYMENT_PENDING',
    paymentStatus: 'UNPAID',
    packageCount: 2,
    finalPrice: 68.0,
    currency: 'USD',
    manualOverride: false,
    createdAt: '2026-04-01T10:00:00Z',
    totalActualWeight: 7.8,
    totalVolumeWeight: 8.5,
    chargeableWeight: 8.5,
    estimatedPrice: 68.0,
    updatedAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'ord_002',
    orderNo: 'ORD-202604-0002',
    userId: 'usr_002',
    user: { id: 'usr_002', userCode: '1024', nickname: '李四' },
    status: 'USER_CONFIRM_PENDING',
    paymentStatus: 'UNPAID',
    packageCount: 1,
    finalPrice: 45.0,
    currency: 'USD',
    manualOverride: false,
    createdAt: '2026-04-02T14:30:00Z',
    totalActualWeight: 5.2,
    totalVolumeWeight: 4.8,
    chargeableWeight: 5.2,
    estimatedPrice: 45.0,
    updatedAt: '2026-04-02T14:30:00Z',
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // For demonstration, use mock data
        // In production: const response = await adminApi.getOrders();
        await new Promise((resolve) => setTimeout(resolve, 500));
        setOrders(mockOrders);
      } catch (err) {
        setError('加载订单失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.userCode.includes(searchQuery);
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingState fullPage message="加载订单..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">订单管理</h1>
            <p className="text-muted-foreground">查看和管理所有用户订单</p>
          </div>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            创建订单
          </button>
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
              <option value="UNINBOUND">未入库</option>
              <option value="INBOUNDED">已入库</option>
              <option value="USER_CONFIRM_PENDING">待用户确认</option>
              <option value="PAYMENT_PENDING">待支付</option>
              <option value="PAID">已支付</option>
              <option value="READY_TO_SHIP">待发货</option>
              <option value="SHIPPED">已发货</option>
              <option value="COMPLETED">已完成</option>
              <option value="EXCEPTION">异常</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6">
        {filteredOrders.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">订单号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">用户</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">包裹数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">订单状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">支付状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">金额</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{order.orderNo}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>{order.user?.nickname || '-'}</div>
                      <div className="text-xs text-muted-foreground">ID: {order.user?.userCode || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.packageCount}</td>
                    <td className="px-4 py-3 text-sm">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      ${order.finalPrice?.toFixed(2) || order.estimatedPrice?.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary hover:underline"
                      >
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="暂无订单"
            description="没有找到符合条件的订单"
            icon="search"
          />
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              显示 {filteredOrders.length} 条结果
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
