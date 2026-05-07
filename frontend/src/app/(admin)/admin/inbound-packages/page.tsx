'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { InboundPackage } from '@/types/admin';
import { ImagePicker, LocalImageList } from '@/components/admin/ImageManager';
import { Pagination } from '@/components/common/Pagination';
import { InboundPackageStatusBadge } from '@/components/common/StatusBadge';
import { TrackingBarcodeScanner } from '@/components/admin/TrackingBarcodeScanner';
import { INBOUND_PACKAGE_STATUS_OPTIONS } from '@/lib/constants/status';
import { CustomerCodeInput, isCustomerCodeComplete } from '@/components/admin/CustomerCodeInput';

function getCreatedEntityId(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id === 'string' && record.id) return record.id;
  for (const key of ['item', 'data']) {
    const nested = record[key];
    if (nested && typeof nested === 'object') {
      const nestedId = (nested as Record<string, unknown>).id;
      if (typeof nestedId === 'string' && nestedId) return nestedId;
    }
  }
  return null;
}

function getLowSensitivityShape(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') return { type: typeof value };
  const record = value as Record<string, unknown>;
  return {
    keys: Object.keys(record),
    hasId: typeof record.id === 'string',
    itemKeys: record.item && typeof record.item === 'object' ? Object.keys(record.item as Record<string, unknown>) : undefined,
    dataKeys: record.data && typeof record.data === 'object' ? Object.keys(record.data as Record<string, unknown>) : undefined,
  };
}

export default function InboundPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<InboundPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    domesticTrackingNo: '', customerCode: '', adminNote: '',
  });
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.listInboundPackages({
        q: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        pageSize: 20,
      });
      setPackages(data?.items || []);
      setTotalPages(data?.totalPages || 1);
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
  }, [search, statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createForm.customerCode && !isCustomerCodeComplete(createForm.customerCode)) {
      setCreateError('客户编号必须是 GJ 加 4 位数字');
      return;
    }
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const pkg = await adminApi.createInboundPackage({
        domesticTrackingNo: createForm.domesticTrackingNo.trim() || null,
        customerCode: createForm.customerCode.trim() || undefined,
        adminNote: createForm.adminNote.trim() || undefined,
      });
      const packageId = getCreatedEntityId(pkg);

      // Upload images if any
      if (localFiles.length > 0) {
        if (!packageId) {
          if (process.env.NODE_ENV === 'development') {
            console.debug('[admin:inbound:create:missing-id]', getLowSensitivityShape(pkg));
          }
          setCreateError('入库包裹已提交但后端未返回包裹 ID，无法上传图片，请刷新列表确认后重试。');
          fetchData();
          return;
        }
        let failCount = 0;
        for (const file of localFiles) {
          try {
            await adminApi.uploadInboundPackageImage(packageId, file);
          } catch {
            failCount++;
          }
        }
        if (failCount > 0) {
          setCreateError(`入库包裹已创建，但 ${failCount} 张图片上传失败，请进入详情页继续上传。`);
          setLocalFiles([]);
          setCreateForm({ domesticTrackingNo: '', customerCode: '', adminNote: '' });
          setTimeout(() => router.push(`/admin/inbound-packages/${packageId}`), 1500);
          return;
        }
      }

      const statusMsg = pkg.status === 'UNIDENTIFIED' || pkg.status === 'UNCLAIMED' ? '已创建为未识别包裹' : '入库包裹创建成功';
      setCreateSuccess(statusMsg + (localFiles.length > 0 ? `，已上传 ${localFiles.length} 张图片` : ''));
      setCreateForm({ domesticTrackingNo: '', customerCode: '', adminNote: '' });
      setLocalFiles([]);
      fetchData();
    } catch (err) {
      if (err instanceof ApiError) {
        const notFoundMsg = err.status === 404 && createForm.customerCode.trim()
          ? '客户编号不存在，请确认后重试。'
          : err.message;
        setCreateError(`${notFoundMsg}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setCreateError('创建失败');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">入库包裹管理</h1>
          <p className="text-sm text-muted-foreground">管理仓库入库包裹记录</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateError(''); setCreateSuccess(''); }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          新增入库
        </button>
      </header>

      <div className="p-4 md:p-6">
        {/* Filters */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索快递单号、客户编号..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="">全部状态</option>
            {INBOUND_PACKAGE_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 rounded-md border bg-background text-sm hover:bg-muted">搜索</button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            <p>{error}</p>
            {errorRequestId && <p className="mt-1 text-xs text-red-500">Request ID: {errorRequestId}</p>}
            <button onClick={fetchData} className="mt-2 text-xs underline">重试</button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && packages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">暂无入库包裹</p>
            <p className="text-sm mt-1">点击右上角新增入库</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && packages.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">国内快递单号</th>
                    <th className="text-left px-4 py-3 font-medium">客户编号</th>
                    <th className="text-left px-4 py-3 font-medium">状态</th>
                    <th className="text-left px-4 py-3 font-medium">图片</th>
                    <th className="text-left px-4 py-3 font-medium">入库时间</th>
                    <th className="text-left px-4 py-3 font-medium">创建/更新</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{pkg.domesticTrackingNo || '未填写'}</td>
                      <td className="px-4 py-3 text-xs">{pkg.customer?.customerCode || <span className="text-yellow-600">未识别</span>}</td>
                      <td className="px-4 py-3"><InboundPackageStatusBadge status={pkg.status} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{pkg.imageUrls?.length || 0} 张</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {pkg.warehouseReceivedAt ? new Date(pkg.warehouseReceivedAt).toLocaleDateString('zh-CN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <p>{new Date(pkg.createdAt).toLocaleDateString('zh-CN')}</p>
                        {pkg.updatedAt && <p>更 {new Date(pkg.updatedAt).toLocaleDateString('zh-CN')}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/inbound-packages/${pkg.id}`} className="text-primary text-xs hover:underline">查看/编辑</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {packages.map((pkg) => (
                <Link key={pkg.id} href={`/admin/inbound-packages/${pkg.id}`} className="block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{pkg.domesticTrackingNo || '未填写'}</span>
                    <InboundPackageStatusBadge status={pkg.status} />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>客户：{pkg.customer?.customerCode || '未识别'}</p>
                    {pkg.imageUrls?.length > 0 && <p>图片：{pkg.imageUrls.length} 张</p>}
                    <p>创建：{new Date(pkg.createdAt).toLocaleDateString('zh-CN')}</p>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">新增入库包裹</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            {createSuccess && <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}
            {createError && <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{createError}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">国内快递单号</label>
                <div className="relative">
                  <input type="text" value={createForm.domesticTrackingNo} onChange={(e) => setCreateForm(f => ({ ...f, domesticTrackingNo: e.target.value }))} placeholder="可选，支持后续补录" className="w-full px-3 py-2 pr-10 rounded-md border bg-background text-sm" />
                  <TrackingBarcodeScanner onConfirm={(value) => setCreateForm(f => ({ ...f, domesticTrackingNo: value }))} />
                </div>
              </div>
              <CustomerCodeInput
                value={createForm.customerCode}
                onChange={(customerCode) => setCreateForm(f => ({ ...f, customerCode }))}
              />
              <div>
                <label className="block text-xs font-medium mb-1">管理员备注</label>
                <textarea value={createForm.adminNote} onChange={(e) => setCreateForm(f => ({ ...f, adminNote: e.target.value }))} rows={2} placeholder="可选" className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">图片</label>
                <ImagePicker onSelect={(files) => setLocalFiles(prev => [...prev, ...files])} disabled={creating} />
                <LocalImageList files={localFiles} onRemove={(i) => setLocalFiles(prev => prev.filter((_, idx) => idx !== i))} />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-md border text-sm hover:bg-muted">取消</button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
