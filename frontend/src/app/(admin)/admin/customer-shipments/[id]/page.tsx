'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { CustomerShipment, CustomerShipmentStatus, PaymentStatus } from '@/types/admin';
import { CustomerShipmentStatusBadge, PaymentStatusBadge } from '@/components/common/StatusBadge';
import { CUSTOMER_SHIPMENT_STATUS_LABELS, CUSTOMER_SHIPMENT_STATUS_OPTIONS, PAYMENT_STATUS_LABELS, normalizeCustomerShipmentStatus } from '@/lib/constants/status';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { ServerImageGrid } from '@/components/admin/ImageManager';

const ALL_STATUSES: CustomerShipmentStatus[] = [
  'PACKED', 'SHIPPED', 'ARRIVED', 'READY_FOR_PICKUP', 'PICKED_UP', 'EXCEPTION',
];

const ALL_PAYMENT_STATUSES: PaymentStatus[] = [
  'UNPAID', 'PENDING', 'PAID', 'WAIVED', 'REFUNDED',
];

export default function CustomerShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<CustomerShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');

  // Action states
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  // Status update
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  // Billing fields
  const [billingForm, setBillingForm] = useState({
    quantity: '1',
    actualWeightKg: '',
    volumeFormula: '',
    billingRateCnyPerKg: '',
    billingWeightKg: '',
  });


  const fetchShipment = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getCustomerShipmentById(id);
      setShipment(data);
      setNewStatus(normalizeCustomerShipmentStatus(data.status));
      setNewPaymentStatus(data.paymentStatus);
      setBillingForm({
        quantity: String(data.quantity || 1),
        actualWeightKg: data.actualWeightKg?.toString() || '',
        volumeFormula: data.volumeFormula || '',
        billingRateCnyPerKg: data.billingRateCnyPerKg?.toString() || '',
        billingWeightKg: data.billingWeightKg?.toString() || '',
      });
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

  useEffect(() => { fetchShipment(); }, [fetchShipment]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === normalizeCustomerShipmentStatus(shipment?.status || '')) return;
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateCustomerShipmentStatus(id, { status: newStatus });
      setShipment(updated);
      setActionMsg('运输状态更新成功');
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

  const handlePaymentStatusUpdate = async () => {
    if (!newPaymentStatus || newPaymentStatus === shipment?.paymentStatus) return;
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.updateCustomerShipmentPaymentStatus(id, { paymentStatus: newPaymentStatus });
      setShipment(updated);
      setActionMsg('费用状态更新成功');
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

  const handleBillingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const quantity = Number(billingForm.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        setActionError('件数必须是大于等于 1 的整数');
        setSaving(false);
        return;
      }
      const updated = await adminApi.updateCustomerShipment(id, {
        quantity,
        actualWeightKg: billingForm.actualWeightKg ? Number(billingForm.actualWeightKg) : null,
        volumeFormula: billingForm.volumeFormula || null,
        billingRateCnyPerKg: billingForm.billingRateCnyPerKg ? Number(billingForm.billingRateCnyPerKg) : null,
        billingWeightKg: billingForm.billingWeightKg ? Number(billingForm.billingWeightKg) : null,
      });
      setShipment(updated);
      setActionMsg('计费信息更新成功');
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
      await adminApi.deleteCustomerShipmentImage(id, imageUrl);
      setShipment(prev => prev ? { ...prev, imageUrls: prev.imageUrls.filter(u => u !== imageUrl) } : prev);
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
      const result = await adminApi.uploadCustomerShipmentImage(id, file);
      setShipment(prev => prev ? { ...prev, imageUrls: [...prev.imageUrls, result.url] } : prev);
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

  const handleCancel = async () => {
    if (!confirm('确定取消该集运单？已发往海外的集运单无法取消。')) return;
    setSaving(true);
    setActionMsg('');
    setActionError('');
    try {
      const updated = await adminApi.cancelCustomerShipment(id);
      setShipment(updated);
      setActionMsg('集运单已取消');
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

  // Delete state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBlockers, setDeleteBlockers] = useState<Record<string, number> | undefined>(undefined);

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteBlockers(undefined);
    try {
      await adminApi.hardDeleteCustomerShipment(id);
      router.push('/admin/customer-shipments');
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
      <div className="flex-1 p-6">
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <p>{error}</p>
          {errorRequestId && <p className="mt-1 text-xs text-red-500">Request ID: {errorRequestId}</p>}
          <button onClick={fetchShipment} className="mt-2 text-xs underline">重试</button>
        </div>
        <Link href="/admin/customer-shipments" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
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
          <Link href="/admin/customer-shipments" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">集运单详情</h1>
            <p className="text-sm text-muted-foreground font-mono">{shipment.shipmentNo}</p>
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
            <div><span className="text-muted-foreground">集运单号：</span><span className="font-mono">{shipment.shipmentNo}</span></div>
            <div><span className="text-muted-foreground">客户：</span>{shipment.customer?.customerCode || '-'} {shipment.customer?.wechatId ? `(${shipment.customer.wechatId})` : ''}</div>
            <div><span className="text-muted-foreground">件数：</span>{shipment.quantity || 1}</div>
            <div className="flex items-center gap-2"><span className="text-muted-foreground">运输状态：</span><CustomerShipmentStatusBadge status={shipment.status} /></div>
            <div className="flex items-center gap-2"><span className="text-muted-foreground">费用状态：</span><PaymentStatusBadge status={shipment.paymentStatus} /></div>
            <div><span className="text-muted-foreground">国际运单号：</span>{shipment.internationalTrackingNo || '-'}</div>
            <div><span className="text-muted-foreground">公开追踪：</span>{shipment.publicTrackingEnabled ? '开启' : '关闭'}</div>
            {shipment.masterShipmentId && (
              <div><span className="text-muted-foreground">所属大货单：</span><span className="font-mono text-xs">{shipment.masterShipmentId}</span></div>
            )}
          </div>
          {shipment.notes && <div className="text-sm"><span className="text-muted-foreground">备注：</span>{shipment.notes}</div>}
        </div>

        {/* Billing Info */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">计费信息</h2>
          <form onSubmit={handleBillingSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">件数</label>
                <input type="number" min={1} step={1} value={billingForm.quantity} onChange={(e) => setBillingForm(f => ({ ...f, quantity: e.target.value }))} className="w-full px-3 py-2 rounded-md border bg-background text-sm" placeholder="例如 3" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">实际重量 (kg)</label>
                <input type="number" step="0.01" value={billingForm.actualWeightKg} onChange={(e) => setBillingForm(f => ({ ...f, actualWeightKg: e.target.value }))} className="w-full px-3 py-2 rounded-md border bg-background text-sm" placeholder="如 2.5" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">体积公式</label>
                <input type="text" value={billingForm.volumeFormula} onChange={(e) => setBillingForm(f => ({ ...f, volumeFormula: e.target.value }))} className="w-full px-3 py-2 rounded-md border bg-background text-sm" placeholder="如 50x40x30/6000" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">计费单价 (¥/kg)</label>
                <input type="number" step="0.01" value={billingForm.billingRateCnyPerKg} onChange={(e) => setBillingForm(f => ({ ...f, billingRateCnyPerKg: e.target.value }))} className="w-full px-3 py-2 rounded-md border bg-background text-sm" placeholder="如 35.00" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">计费重量 (kg)</label>
                <input type="number" step="0.01" value={billingForm.billingWeightKg} onChange={(e) => setBillingForm(f => ({ ...f, billingWeightKg: e.target.value }))} className="w-full px-3 py-2 rounded-md border bg-background text-sm" placeholder="如 3.0" />
              </div>
            </div>
            {billingForm.billingRateCnyPerKg && billingForm.billingWeightKg && (
              <p className="text-sm font-medium text-primary">
                预估费用：¥{(Number(billingForm.billingRateCnyPerKg) * Number(billingForm.billingWeightKg)).toFixed(2)}
              </p>
            )}
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
              <Save className="h-4 w-4" />
              {saving ? '保存中...' : '保存计费信息'}
            </button>
          </form>
        </div>

        {/* Images */}
        <ServerImageGrid
          imageUrls={shipment.imageUrls || []}
          onDelete={handleDeleteImage}
          onUpload={handleUploadImage}
          saving={saving}
          title="集运单图片"
        />

        {/* Update Status */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">更新运输状态</h2>
          <div className="flex gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
            >
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{CUSTOMER_SHIPMENT_STATUS_OPTIONS.find(option => option.value === s)?.label || CUSTOMER_SHIPMENT_STATUS_LABELS[s] || s}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={saving || newStatus === normalizeCustomerShipmentStatus(shipment.status)}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              更新
            </button>
          </div>
        </div>

        {/* Update Payment Status */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">更新费用状态</h2>
          <div className="flex gap-2">
            <select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
            >
              {ALL_PAYMENT_STATUSES.map(s => (
                <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s] || s}</option>
              ))}
            </select>
            <button
              onClick={handlePaymentStatusUpdate}
              disabled={saving || newPaymentStatus === shipment.paymentStatus}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              更新
            </button>
          </div>
        </div>

        {/* Cancel & Delete */}
        <div className="rounded-lg border border-red-100 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">取消集运单会将包含的入库包裹恢复为&ldquo;已入库&rdquo;状态。已发货后的集运单无法取消。</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
            >
              取消集运单
            </button>
            <button
              onClick={() => setShowDelete(true)}
              disabled={saving}
              className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
            >
              永久删除
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>创建时间：{new Date(shipment.createdAt).toLocaleString('zh-CN')}</p>
          {shipment.updatedAt && <p>更新时间：{new Date(shipment.updatedAt).toLocaleString('zh-CN')}</p>}
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeleteError(''); setDeleteBlockers(undefined); }}
        onConfirm={handleDelete}
        title="永久删除集运单"
        description="删除后此集运单数据将不可恢复。如存在关联交易记录或已发货，系统会阻止删除。"
        confirmText="DELETE"
        entityLabel={shipment.shipmentNo}
        blockers={deleteBlockers}
        error={deleteError}
      />
    </div>
  );
}
