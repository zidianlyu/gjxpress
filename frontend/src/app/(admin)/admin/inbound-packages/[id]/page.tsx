'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { InboundPackage, InboundPackageStatus } from '@/types/admin';
import { InboundPackageStatusBadge } from '@/components/common/StatusBadge';
import { INBOUND_PACKAGE_STATUS_LABELS, INBOUND_PACKAGE_STATUS_OPTIONS, normalizeInboundPackageStatus } from '@/lib/constants/status';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { ServerImageGrid } from '@/components/admin/ImageManager';
import { CustomerCodeInput, isCustomerCodeComplete } from '@/components/admin/CustomerCodeInput';
import { formatDateTime } from '@/lib/format';

const ALL_STATUSES: InboundPackageStatus[] = [
  'UNIDENTIFIED', 'ARRIVED', 'CONSOLIDATED',
];

function toDateTimeLocal(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function buildForm(pkg: InboundPackage) {
  return {
    domesticTrackingNo: pkg.domesticTrackingNo || '',
    customerCode: pkg.customer?.customerCode || '',
    status: normalizeInboundPackageStatus(pkg.status),
    warehouseReceivedAt: toDateTimeLocal(pkg.warehouseReceivedAt),
    adminNote: pkg.adminNote || '',
    issueNote: pkg.issueNote || '',
  };
}

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
  const [form, setForm] = useState({
    domesticTrackingNo: '',
    customerCode: '',
    status: 'UNIDENTIFIED',
    warehouseReceivedAt: '',
    adminNote: '',
    issueNote: '',
  });


  const fetchPkg = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getInboundPackageById(id);
      if (!data?.id) {
        setError('未找到入库包裹');
        return;
      }
      setPkg(data);
      setForm(buildForm(data));
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.customerCode && !isCustomerCodeComplete(form.customerCode)) {
      setActionError('客户编号必须是 GJ 加 4 位数字');
      return;
    }
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateInboundPackage(id, {
        domesticTrackingNo: form.domesticTrackingNo.trim() || null,
        customerCode: form.customerCode.trim() || null,
        status: form.status,
        warehouseReceivedAt: fromDateTimeLocal(form.warehouseReceivedAt),
        adminNote: form.adminNote.trim() || null,
        issueNote: form.issueNote.trim() || null,
      });
      setPkg(updated);
      setForm(buildForm(updated));
      setActionMsg('保存成功');
    } catch (err) {
      if (err instanceof ApiError) {
        const notFoundMsg = err.status === 404 && form.customerCode.trim()
          ? '客户编号不存在，请确认后重试。'
          : err.message;
        setActionError(`${notFoundMsg}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setActionError('保存失败');
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
            <p className="text-sm text-muted-foreground font-mono">{pkg.domesticTrackingNo || '未填写国内快递单号'}</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-3xl space-y-6">
        {actionMsg && <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{actionMsg}</div>}
        {actionError && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{actionError}</div>}

        <form onSubmit={handleSave} className="rounded-lg border p-4 space-y-4">
          <h2 className="font-semibold">基础信息</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">国内快递单号：</span>{pkg.domesticTrackingNo || '未填写'}</div>
            <div><span className="text-muted-foreground">状态：</span><InboundPackageStatusBadge status={pkg.status} /></div>
            <div><span className="text-muted-foreground">客户编号：</span>{pkg.customer ? `${pkg.customer.customerCode} (${pkg.customer.wechatId || pkg.customer.phoneNumber || ''})` : '未识别'}</div>
            <div><span className="text-muted-foreground">入库时间：</span>{formatDateTime(pkg.warehouseReceivedAt)}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">国内快递单号</label>
              <input
                type="text"
                value={form.domesticTrackingNo}
                onChange={(e) => setForm(f => ({ ...f, domesticTrackingNo: e.target.value }))}
                placeholder="可选"
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              />
            </div>
            <CustomerCodeInput
              value={form.customerCode}
              onChange={(customerCode) => setForm(f => ({ ...f, customerCode }))}
            />
            <div>
              <label className="block text-xs font-medium mb-1">状态</label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{INBOUND_PACKAGE_STATUS_OPTIONS.find(option => option.value === s)?.label || INBOUND_PACKAGE_STATUS_LABELS[s] || s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">入库时间</label>
              <input
                type="datetime-local"
                value={form.warehouseReceivedAt}
                onChange={(e) => setForm(f => ({ ...f, warehouseReceivedAt: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">管理员备注</label>
            <textarea
              value={form.adminNote}
              onChange={(e) => setForm(f => ({ ...f, adminNote: e.target.value }))}
              rows={2}
              placeholder="可选"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">异常备注</label>
            <textarea
              value={form.issueNote}
              onChange={(e) => setForm(f => ({ ...f, issueNote: e.target.value }))}
              rows={2}
              placeholder="可选"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存编辑'}
          </button>
        </form>

        {/* Images */}
        <ServerImageGrid
          imageUrls={pkg.imageUrls || []}
          onDelete={handleDeleteImage}
          onUpload={handleUploadImage}
          saving={saving}
          title="包裹图片"
        />

        <div className="text-xs text-muted-foreground">
          <p>创建时间：{formatDateTime(pkg.createdAt)}</p>
          <p>更新时间：{formatDateTime(pkg.updatedAt)}</p>
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
        entityLabel={pkg.domesticTrackingNo || '未填写单号包裹'}
        error={deleteError}
      />
    </div>
  );
}
