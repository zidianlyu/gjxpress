'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { TransactionRecord } from '@/types/admin';
import { formatAmountCents, formatDateTime } from '@/lib/format';
import { formatTransactionSubtitle } from '@/lib/admin/payment-order';
import { formatShipmentType } from '@/lib/shipment-types';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { AdminBlockingOverlay } from '@/components/admin/AdminBlockingOverlay';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [txn, setTxn] = useState<TransactionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');

  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const [adminNoteDraft, setAdminNoteDraft] = useState('');

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTxn = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getTransactionById(id);
      setTxn(data);
      setAdminNoteDraft(data.adminNote || '');
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

  useEffect(() => { fetchTxn(); }, [fetchTxn]);

  const handleSave = async () => {
    setSaving(true); setActionMsg(''); setActionError('');
    try {
      await adminApi.updateTransaction(id, {
        adminNote: adminNoteDraft.trim() || null,
      });
      const refreshed = await adminApi.getTransactionById(id);
      setTxn(refreshed);
      setAdminNoteDraft(refreshed.adminNote || '');
      setActionMsg('保存成功');
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '保存失败');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      await adminApi.hardDeleteTransaction(id);
      setShowDelete(false);
      router.push('/admin/transactions');
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
    return <div className="flex-1 flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <p>{error}</p>
          {errorRequestId && <p className="mt-1 text-xs break-all">Request ID: {errorRequestId}</p>}
          <button onClick={fetchTxn} className="mt-2 text-xs underline">重试</button>
        </div>
        <Link href="/admin/transactions" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </Link>
      </div>
    );
  }

  if (!txn) return null;
  const customerCode = txn.customerShipment?.customer?.customerCode || txn.customer?.customerCode || '未知客户';
  const shipmentNo = txn.customerShipment?.shipmentNo || '未生成';
  const shipmentTypeText = formatShipmentType(txn.customerShipment?.shipmentType);
  const updatedAtText = formatDateTime(txn.updatedAt || txn.createdAt);

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/transactions" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">支付订单详情</h1>
            <p className="text-sm text-muted-foreground font-mono">{formatTransactionSubtitle(txn)}</p>
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
            <div><span className="text-muted-foreground">客户：</span><span className="font-mono text-xs">{customerCode}</span></div>
            <div><span className="text-muted-foreground">集运单：</span><span className="font-mono text-xs">{shipmentNo}</span></div>
            <div><span className="text-muted-foreground">运输类型：</span>{shipmentTypeText}</div>
            <div><span className="text-muted-foreground">金额：</span><span className="font-mono font-semibold">{formatAmountCents(txn.amountCents)}</span></div>
            <div><span className="text-muted-foreground">创建时间：</span>{formatDateTime(txn.createdAt)}</div>
            <div><span className="text-muted-foreground">更新时间：</span>{updatedAtText}</div>
          </div>
          {txn.adminNote && <p className="text-sm"><span className="text-muted-foreground">备注：</span>{txn.adminNote}</p>}
        </div>

        {/* Edit */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">编辑</h2>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">备注</label>
              <textarea value={adminNoteDraft} onChange={(e) => setAdminNoteDraft(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md border text-sm" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 w-full sm:w-auto">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-200 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">永久删除此支付订单，此操作不可恢复。</p>
          <button onClick={() => setShowDelete(true)} disabled={saving || isDeleting} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
            永久删除
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => {
          if (isDeleting) return;
          setShowDelete(false);
          setDeleteError('');
        }}
        onConfirm={handleDelete}
        title="删除订单"
        description="删除后此支付订单数据将不可恢复。"
        confirmText="DELETE"
        confirmButtonText="删除"
        cancelButtonText="取消"
        requireTypedConfirmation={false}
        entityLabel={`${shipmentTypeText} ${formatAmountCents(txn.amountCents)}`}
        error={deleteError}
      />
      {isDeleting && <AdminBlockingOverlay title="正在删除，请稍候" description="正在删除订单..." />}
    </div>
  );
}
