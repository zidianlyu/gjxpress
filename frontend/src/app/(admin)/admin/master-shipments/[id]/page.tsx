'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { MasterShipment } from '@/types/admin';
import { CustomerShipmentStatusBadge, MasterShipmentStatusBadge, PaymentStatusBadge } from '@/components/common/StatusBadge';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { AdminBlockingOverlay } from '@/components/admin/AdminBlockingOverlay';
import { formatShipmentType } from '@/lib/shipment-types';

export default function MasterShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<MasterShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [note, setNote] = useState('');

  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
  };

  const fetchShipment = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getMasterShipmentById(id);
      setShipment(data);
      setNote(data.note ?? data.adminNote ?? '');
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

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

  const handleSaveNote = async () => {
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateMasterShipment(id, {
        note: note.trim() || null,
      });
      setShipment(updated);
      setNote(updated.note ?? updated.adminNote ?? '');
      setActionMsg('备注已保存');
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePublicationToggle = async () => {
    if (!shipment) return;
    const nextPublished = !(shipment.publicPublished ?? shipment.publicVisible ?? false);
    setPublishing(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateMasterShipmentPublication(id, {
        publicPublished: nextPublished,
      });
      setShipment(updated);
      setActionMsg(nextPublished ? '已公开发布' : '已撤销发布');
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '更新失败');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      const result = await adminApi.hardDeleteMasterShipment(id);
      if (result.detachedCustomerShipmentCount != null) {
        window.sessionStorage.setItem('gjx_admin_notice', `已删除批次，并解除 ${result.detachedCustomerShipmentCount} 个集运单关联。`);
      }
      router.push('/admin/master-shipments');
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setDeleteError('删除失败');
      }
      setIsDeleting(false);
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
      <div className="flex-1 p-4 md:p-6">
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <p>{error}</p>
          {errorRequestId && <p className="mt-1 text-xs break-all">Request ID: {errorRequestId}</p>}
          <button onClick={fetchShipment} className="mt-2 text-xs underline">重试</button>
        </div>
        <Link href="/admin/master-shipments" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </Link>
      </div>
    );
  }

  if (!shipment) return null;
  const isPublished = shipment.publicPublished ?? shipment.publicVisible ?? false;

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/master-shipments" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">国际批次详情</h1>
            <p className="text-sm text-muted-foreground font-mono">{shipment.batchNo}</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-3xl space-y-6">
        {actionMsg && <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{actionMsg}</div>}
        {actionError && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm break-all">{actionError}</div>}

        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">基础信息</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">批次号：</span>
              <span className="font-mono">{shipment.batchNo}</span>
            </div>
            <div>
              <span className="text-muted-foreground">运输类型：</span>
              {formatShipmentType(shipment.shipmentType)}
            </div>
            <div>
              <span className="text-muted-foreground">供应商：</span>
              {shipment.vendorName || '-'}
            </div>
            <div>
              <span className="text-muted-foreground">供应商单号：</span>
              <span className="font-mono text-xs">{shipment.vendorTrackingNo || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">批次状态：</span>
              <MasterShipmentStatusBadge status={shipment.status} />
            </div>
            <div>
              <span className="text-muted-foreground">公开：</span>
              {isPublished ? '已公开' : '未公开'}
            </div>
            <div>
              <span className="text-muted-foreground">创建时间：</span>
              {formatDateTime(shipment.createdAt)}
            </div>
            <div>
              <span className="text-muted-foreground">更新时间：</span>
              {formatDateTime(shipment.updatedAt)}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t">
            <h3 className="text-sm font-medium">关联集运单</h3>
            {shipment.customerShipments && shipment.customerShipments.length > 0 ? (
              <div className="divide-y rounded-md border">
                {shipment.customerShipments.map((cs) => (
                  <div key={cs.id} className="flex flex-col gap-1 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0 break-words">
                      <span className="font-mono text-xs">{cs.shipmentNo || '未生成单号'}</span>
                      <span className="text-muted-foreground"> · {cs.customer?.customerCode || '未知客户'} · {formatShipmentType(cs.shipmentType)}</span>
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <PaymentStatusBadge status={cs.paymentStatus || ''} />
                      <CustomerShipmentStatusBadge status={cs.status || ''} />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无关联集运单。</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">编辑备注</h2>
          <div>
            <label className="block text-xs font-medium mb-1">管理员备注</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border text-sm" />
          </div>
          <button onClick={handleSaveNote} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 w-full sm:w-auto">
            {saving ? '保存中...' : '保存备注'}
          </button>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">公开发布</h2>
          <p className="text-sm text-muted-foreground">当前状态：{isPublished ? '已公开' : '未公开'}</p>
          <button onClick={handlePublicationToggle} disabled={publishing} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50 w-full sm:w-auto">
            {publishing ? '处理中...' : isPublished ? '撤销发布' : '公开发布'}
          </button>
        </div>

        <div className="rounded-lg border border-red-200 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">永久删除此国际批次。删除后会解除关联集运单。</p>
          <button onClick={() => setShowDelete(true)} disabled={saving || publishing || isDeleting} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
            永久删除
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => {
          setShowDelete(false);
          setDeleteError('');
        }}
        onConfirm={handleDelete}
        title="删除批次"
        description="删除后此批次数据将不可恢复，并会解除关联集运单。"
        confirmText="DELETE"
        confirmButtonText="删除"
        cancelButtonText="取消"
        requireTypedConfirmation={false}
        entityLabel={shipment.batchNo}
        error={deleteError}
      />
      {publishing && <AdminBlockingOverlay title="正在提交，请稍候" description={isPublished ? '正在撤销发布...' : '正在公开发布...'} />}
      {isDeleting && <AdminBlockingOverlay title="正在删除，请稍候" description="正在删除批次..." />}
    </div>
  );
}
