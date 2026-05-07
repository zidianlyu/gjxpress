'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { MasterShipment } from '@/types/admin';
import { MasterShipmentStatusBadge } from '@/components/common/StatusBadge';
import { MASTER_SHIPMENT_STATUS_LABELS } from '@/lib/constants/status';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { safeShortId } from '@/lib/api/unwrap';

const ALL_STATUSES = ['CREATED', 'HANDED_TO_VENDOR', 'IN_TRANSIT', 'TRANSFER_OR_CUSTOMS_PROCESSING', 'ARRIVED_OVERSEAS', 'CLOSED', 'EXCEPTION'];

export default function MasterShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<MasterShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');

  // Actions
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // Edit fields
  const [vendorName, setVendorName] = useState('');
  const [vendorTrackingNo, setVendorTrackingNo] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // Status update
  const [newStatus, setNewStatus] = useState('');

  // Publication
  const [pubVisible, setPubVisible] = useState(false);
  const [pubTitle, setPubTitle] = useState('');
  const [pubSummary, setPubSummary] = useState('');
  const [pubStatusText, setPubStatusText] = useState('');

  // Add customer shipments
  const [csIdsInput, setCsIdsInput] = useState('');

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBlockers, setDeleteBlockers] = useState<Record<string, number> | undefined>(undefined);

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
      setVendorName(data.vendorName || '');
      setVendorTrackingNo(data.vendorTrackingNo || '');
      setAdminNote(data.adminNote || '');
      setNewStatus(data.status);
      setPubVisible(data.publicVisible);
      setPubTitle(data.publicTitle || '');
      setPubSummary(data.publicSummary || '');
      setPubStatusText(data.publicStatusText || '');
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

  const handleSaveBasic = async () => {
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateMasterShipment(id, {
        vendorName,
        vendorTrackingNo,
        adminNote,
      });
      setShipment(updated);
      setActionMsg('基础信息已保存');
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === shipment?.status) return;
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateMasterShipmentStatus(id, {
        status: newStatus,
      });
      setShipment(updated);
      setActionMsg('状态已更新');
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePublicationUpdate = async () => {
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateMasterShipmentPublication(id, {
        publicVisible: pubVisible,
        publicTitle: pubTitle || undefined,
        publicSummary: pubSummary || undefined,
        publicStatusText: pubStatusText || undefined,
      });
      setShipment(updated);
      setActionMsg('公开状态已更新');
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCS = async () => {
    if (!csIdsInput.trim()) return;
    const ids = csIdsInput
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) return;
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      await adminApi.addCustomerShipmentsToMaster(id, {
        customerShipmentIds: ids,
      });
      setActionMsg(`已添加 ${ids.length} 个集运单`);
      setCsIdsInput('');
      fetchShipment();
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '添加失败');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCS = async (csId: string) => {
    if (!confirm('确定移除此集运单？')) return;
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      await adminApi.removeCustomerShipmentFromMaster(id, csId);
      setActionMsg('已移除集运单');
      fetchShipment();
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '移除失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteBlockers(undefined);
    try {
      await adminApi.hardDeleteMasterShipment(id);
      router.push('/admin/master-shipments');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.details) {
          setDeleteBlockers(err.details as Record<string, number>);
        } else {
          setDeleteError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
        }
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
      <div className="flex-1 p-4 md:p-6">
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <p>{error}</p>
          {errorRequestId && <p className="mt-1 text-xs break-all">Request ID: {errorRequestId}</p>}
          <button onClick={fetchShipment} className="mt-2 text-xs underline">
            重试
          </button>
        </div>
        <Link href="/admin/master-shipments" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </Link>
      </div>
    );
  }

  if (!shipment) return null;

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

        {/* Basic Info */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">基础信息</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">批次号：</span>
              <span className="font-mono">{shipment.batchNo}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">状态：</span>
              <MasterShipmentStatusBadge status={shipment.status} />
            </div>
            <div>
              <span className="text-muted-foreground">公开：</span>
              {shipment.publicVisible ? '是' : '否'}
            </div>
            <div>
              <span className="text-muted-foreground">创建时间：</span>
              {formatDateTime(shipment.createdAt)}
            </div>
          </div>
        </div>

        {/* Edit Basic */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">编辑信息</h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">供应商名称</label>
              <input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="w-full px-3 py-2 rounded-md border text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">供应商运单号</label>
              <input type="text" value={vendorTrackingNo} onChange={(e) => setVendorTrackingNo(e.target.value)} className="w-full px-3 py-2 rounded-md border text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">管理员备注</label>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-md border text-sm" />
            </div>
          </div>
          <button onClick={handleSaveBasic} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 w-full sm:w-auto">
            保存
          </button>
        </div>

        {/* Status Update */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">更新状态</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="flex-1 px-3 py-2 rounded-md border text-sm">
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {MASTER_SHIPMENT_STATUS_LABELS[s] || s}
                </option>
              ))}
            </select>
            <button onClick={handleStatusUpdate} disabled={saving || newStatus === shipment.status} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50 w-full sm:w-auto">
              更新
            </button>
          </div>
        </div>

        {/* Publication */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">公开发布设置</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pubVisible} onChange={(e) => setPubVisible(e.target.checked)} className="rounded" />
              公开可见
            </label>
            <div>
              <label className="block text-xs font-medium mb-1">公开标题</label>
              <input type="text" value={pubTitle} onChange={(e) => setPubTitle(e.target.value)} className="w-full px-3 py-2 rounded-md border text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">公开摘要</label>
              <textarea value={pubSummary} onChange={(e) => setPubSummary(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-md border text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">公开状态文本</label>
              <input type="text" value={pubStatusText} onChange={(e) => setPubStatusText(e.target.value)} className="w-full px-3 py-2 rounded-md border text-sm" />
            </div>
          </div>
          <button onClick={handlePublicationUpdate} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50 w-full sm:w-auto">
            更新公开设置
          </button>
        </div>

        {/* Customer Shipments */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">关联集运单</h2>
          {shipment.customerShipments && shipment.customerShipments.length > 0 ? (
            <div className="space-y-2">
              {shipment.customerShipments.map((cs) => (
                <div key={cs.id} className="flex items-center justify-between p-2 rounded border text-sm">
                  <span className="font-mono text-xs">{cs.shipmentNo || safeShortId(cs.id)}</span>
                  <button onClick={() => handleRemoveCS(cs.id)} disabled={saving} className="text-red-600 text-xs hover:underline">
                    移除
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">暂无关联集运单</p>
          )}
          <div>
            <label className="block text-xs font-medium mb-1">添加集运单 ID（多个用逗号或换行分隔）</label>
            <textarea value={csIdsInput} onChange={(e) => setCsIdsInput(e.target.value)} rows={2} placeholder="集运单 ID" className="w-full px-3 py-2 rounded-md border text-sm font-mono" />
          </div>
          <button onClick={handleAddCS} disabled={saving || !csIdsInput.trim()} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50 w-full sm:w-auto">
            添加
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-200 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">永久删除此国际批次。如果存在关联集运单，系统将阻止删除。</p>
          <button onClick={() => setShowDelete(true)} disabled={saving} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
            永久删除
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => {
          setShowDelete(false);
          setDeleteError('');
          setDeleteBlockers(undefined);
        }}
        onConfirm={handleDelete}
        title="永久删除国际批次"
        description="删除后此批次数据将不可恢复。如果存在关联集运单，系统会阻止删除。"
        confirmText="DELETE"
        entityLabel={shipment.batchNo}
        blockers={deleteBlockers}
        error={deleteError}
      />
    </div>
  );
}
