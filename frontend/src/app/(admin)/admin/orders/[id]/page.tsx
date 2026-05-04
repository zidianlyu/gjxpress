'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, User, CreditCard, Truck, History } from 'lucide-react';
import { Order, Package as PackageType } from '@/lib/api/admin';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/common/StatusBadge';

// Mock data
const mockOrder: Order & { packages: PackageType[] } = {
  id: 'ord_001',
  orderNo: 'ORD-202604-0001',
  userId: 'usr_001',
  user: { id: 'usr_001', userCode: '1023', nickname: '张三' },
  status: 'PAYMENT_PENDING',
  paymentStatus: 'UNPAID',
  packageCount: 2,
  totalActualWeight: 7.8,
  totalVolumeWeight: 8.5,
  chargeableWeight: 8.5,
  estimatedPrice: 68.0,
  finalPrice: 68.0,
  currency: 'USD',
  manualOverride: false,
  createdAt: '2026-04-01T10:00:00Z',
  updatedAt: '2026-04-01T10:00:00Z',
  packages: [
    {
      id: 'pkg_001',
      packageNo: 'PKG-0001',
      orderId: 'ord_001',
      domesticTrackingNo: 'SF123456789',
      sourcePlatform: '淘宝',
      status: 'USER_CONFIRM_PENDING',
      actualWeight: 3.5,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 20,
      volumeWeight: 2.5,
      inboundAt: '2026-04-01T08:00:00Z',
    },
    {
      id: 'pkg_002',
      packageNo: 'PKG-0002',
      orderId: 'ord_001',
      domesticTrackingNo: 'JD987654321',
      sourcePlatform: '京东',
      status: 'CONFIRMED',
      actualWeight: 4.3,
      lengthCm: 35,
      widthCm: 30,
      heightCm: 25,
      volumeWeight: 4.375,
      inboundAt: '2026-04-01T09:00:00Z',
    },
  ],
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<(Order & { packages: PackageType[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // For demonstration, use mock data
        // In production: const response = await adminApi.getOrderById(orderId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setOrder(mockOrder);
      } catch {
        setError('加载订单详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return <LoadingState fullPage message="加载订单详情..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (!order) {
    return <ErrorState message="订单不存在" />;
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回订单列表
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{order.orderNo}</h1>
            <p className="text-muted-foreground">订单详情</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors">
              修改状态
            </button>
            <button className="px-4 py-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              创建发货
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground mb-1">订单状态</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground mb-1">支付状态</p>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>

            {/* User Info */}
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                用户信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">用户昵称</p>
                  <p className="font-medium">{order.user?.nickname || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">用户码</p>
                  <p className="font-medium">{order.user?.userCode || '-'}</p>
                </div>
              </div>
            </div>

            {/* Packages */}
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                包裹列表 ({order.packages.length})
              </h3>
              <div className="space-y-4">
                {order.packages.map((pkg) => (
                  <div key={pkg.id} className="p-4 rounded-md bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{pkg.packageNo}</span>
                      <OrderStatusBadge status={pkg.status} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">快递单号</p>
                        <p>{pkg.domesticTrackingNo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">来源平台</p>
                        <p>{pkg.sourcePlatform}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">实际重量</p>
                        <p>{pkg.actualWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">体积重量</p>
                        <p>{pkg.volumeWeight} kg</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      尺寸: {pkg.lengthCm} × {pkg.widthCm} × {pkg.heightCm} cm
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Log */}
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                操作日志
              </h3>
              <div className="text-sm text-muted-foreground">
                <p>暂无操作记录</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Info */}
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                费用信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">实际总重量</span>
                  <span>{order.totalActualWeight} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">体积总重量</span>
                  <span>{order.totalVolumeWeight} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">计费重量</span>
                  <span className="font-medium">{order.chargeableWeight} kg</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">预估费用</span>
                    <span className="font-bold text-lg">${order.estimatedPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipment Info */}
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                发货信息
              </h3>
              <div className="text-sm text-muted-foreground">
                <p>尚未创建发货记录</p>
                <button className="mt-3 w-full px-4 py-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  创建发货
                </button>
              </div>
            </div>

            {/* Order Meta */}
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold mb-4">订单信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">订单 ID</span>
                  <span className="font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">创建时间</span>
                  <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">更新时间</span>
                  <span>{new Date(order.updatedAt).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
