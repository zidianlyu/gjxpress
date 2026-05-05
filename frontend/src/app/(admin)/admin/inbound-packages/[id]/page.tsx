'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { InboundPackage, InboundPackageStatus } from '@/types/admin';
import { InboundPackageStatusBadge } from '@/components/common/StatusBadge';
import { INBOUND_PACKAGE_STATUS_LABELS } from '@/lib/constants/status';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { ServerImageGrid } from '@/components/admin/ImageManager';

const ALL_STATUSES: InboundPackageStatus[] = [
  'UNCLAIMED', 'CLAIMED', 'PREALERTED_NOT_ARRIVED', 'ARRIVED_WAREHOUSE',
  'PENDING_CONFIRMATION', 'CONFIRMED', 'ISSUE_REPORTED', 'CONSOLIDATED', 'INBOUND_EXCEPTION',
];

export default function InboundPackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [pkg, setPkg] = useState<InboundPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');

  // Action states
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // Assign customer
  const [assignCode, setAssignCode] = useState('');
  // Status update
  const [newStatus, setNewStatus] = useState('');


  const fetchPkg = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getInboundPackageById(id);
      setPkg(data);
      setNewStatus(data.status);
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
  }, [id]);

  useEffect(() => { fetchPkg(); }, [fetchPkg]);

  const handleAssignCustomer = async () => {
    if (!assignCode.trim()) return;
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.assignCustomerToPackage(id, { customerCode: assignCode.trim() });
      setPkg(updated);
      setAssignCode('');
      setActionMsg('客户绑定成功');
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setActionError('操作失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === pkg?.status) return;
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateInboundPackageStatus(id, { status: newStatus });
      setPkg(updated);
      setActionMsg('状态更新成功');
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setActionError('操作失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      await adminApi.deleteInboundPackageImage(id, imageUrl);
      setPkg(prev => prev ? { ...prev, imageUrls: prev.imageUrls.filter(u => u !== imageUrl) } : prev);
      setActionMsg('图片已删除');
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setActionError('删除图片失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    setActionMsg('');
    setActionError('');
    try {
      const result = await adminApi.uploadInboundPackageImage(id, file);
      setPkg(prev => prev ? { ...prev, imageUrls: [...prev.imageUrls, result.url] } : prev);
      setActionMsg('图片上传成功');
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(`上传失败: ${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setActionError('上传图片失败');
      }
      throw err;
    }
  };

  // Delete state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeletePkg = async () => {
    setDeleteError('');
    try {
      await adminApi.hardDeleteInboundPackage(id);
      router.push('/admin/inbound-packages');
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setDeleteError('删除失败');
      }
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <p>{error}</p>
          {errorRequestId && <p className="mt-1 text-xs text-red-500">Request ID: {errorRequestId}</p>}
          <button onClick={fetchPkg} className="mt-2 text-xs underline">重试</button>
        </div>
        <Link href="/admin/inbound-packages" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </Link>
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/inbound-packages" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">入库包裹详情</h1>
            <p className="text-sm text-muted-foreground font-mono">{pkg.domesticTrackingNo || '无快递单号'}</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-3xl space-y-6">
        {actionMsg && <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{actionMsg}</div>}
        {actionError && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{actionError}</div>}

        {/* Basic Info */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">基础信息</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">快递单号：</span>{pkg.domesticTrackingNo || '-'}</div>
            <div><span className="text-muted-foreground">状态：</span><InboundPackageStatusBadge status={pkg.status} /></div>
            <div><span className="text-muted-foreground">客户：</span>{pkg.customer ? `${pkg.customer.customerCode} (${pkg.customer.wechatId || pkg.customer.phoneNumber || ''})` : '未归属'}</div>
            <div><span className="text-muted-foreground">入库时间：</span>{pkg.warehouseReceivedAt ? new Date(pkg.warehouseReceivedAt).toLocaleString('zh-CN') : '-'}</div>
          </div>
          {pkg.adminNote && <div className="text-sm"><span className="text-muted-foreground">管理员备注：</span>{pkg.adminNote}</div>}
          {pkg.issueNote && <div className="text-sm"><span className="text-muted-foreground">异常备注：</span>{pkg.issueNote}</div>}
        </div>

        {/* Images */}
        <ServerImageGrid
          imageUrls={pkg.imageUrls || []}
          onDelete={handleDeleteImage}
          onUpload={handleUploadImage}
          saving={saving}
          title="包裹图片"
        />

        {/* Assign Customer */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">绑定客户</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={assignCode}
              onChange={(e) => setAssignCode(e.target.value)}
              placeholder="输入客户编号，如 GJ0001"
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
            />
            <button
              onClick={handleAssignCustomer}
              disabled={saving || !assignCode.trim()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              绑定
            </button>
          </div>
        </div>

        {/* Update Status */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">更新状态</h2>
          <div className="flex gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
            >
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{INBOUND_PACKAGE_STATUS_LABELS[s] || s}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={saving || newStatus === pkg.status}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              更新
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>创建时间：{new Date(pkg.createdAt).toLocaleString('zh-CN')}</p>
          {pkg.updatedAt && <p>更新时间：{new Date(pkg.updatedAt).toLocaleString('zh-CN')}</p>}
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-200 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">永久删除此入库包裹，此操作不可恢复。</p>
          <button onClick={() => setShowDelete(true)} disabled={saving} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
            永久删除
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeleteError(''); }}
        onConfirm={handleDeletePkg}
        title="永久删除入库包裹"
        description="删除后此入库包裹数据将不可恢复。"
        confirmText="DELETE"
        entityLabel={pkg.domesticTrackingNo || pkg.id.slice(0, 8)}
        error={deleteError}
      />
    </div>
  );
}
