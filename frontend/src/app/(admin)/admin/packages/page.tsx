'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Package as PackageType } from '@/lib/api/admin';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { PackageStatusBadge } from '@/components/common/StatusBadge';

// Mock data
const mockPackages: (PackageType & { userCode: string })[] = [
  {
    id: 'pkg_001',
    packageNo: 'PKG-0001',
    orderId: 'ord_001',
    userCode: '1023',
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
    userCode: '1023',
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
];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<(PackageType & { userCode: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setPackages(mockPackages);
      } catch {
        setError('加载包裹失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const filteredPackages = packages.filter((pkg) =>
    searchQuery === '' ||
    pkg.packageNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.domesticTrackingNo.includes(searchQuery) ||
    pkg.userCode.includes(searchQuery)
  );

  if (isLoading) {
    return <LoadingState fullPage message="加载包裹..." />;
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
            <h1 className="text-2xl font-bold">包裹管理</h1>
            <p className="text-muted-foreground">查看和管理所有包裹</p>
          </div>
          <Link
            href="/admin/packages/inbound"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新增入库
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索包裹号、快递单号、用户码..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
            />
          </div>
        </div>
      </div>

      {/* Packages Table */}
      <div className="p-6">
        {filteredPackages.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">包裹号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">用户码</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">快递单号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">来源平台</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">重量</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">入库时间</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{pkg.packageNo}</td>
                    <td className="px-4 py-3 text-sm">{pkg.userCode}</td>
                    <td className="px-4 py-3 text-sm">{pkg.domesticTrackingNo}</td>
                    <td className="px-4 py-3 text-sm">{pkg.sourcePlatform}</td>
                    <td className="px-4 py-3 text-sm">
                      <PackageStatusBadge status={pkg.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {pkg.actualWeight} kg
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {pkg.lengthCm}×{pkg.widthCm}×{pkg.heightCm} cm
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(pkg.inboundAt).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="暂无包裹"
            description="没有找到符合条件的包裹"
            icon="package"
            action={{
              label: '新增入库',
              onClick: () => window.location.href = '/admin/packages/inbound',
            }}
          />
        )}

        {filteredPackages.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              显示 {filteredPackages.length} 条结果
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
