'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { TransactionRecord } from '@/types/admin';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants/status';
import { formatAmountCents, centsToYuan, parseYuanToCents } from '@/lib/format';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';

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

  // Edit fields
  const [editType, setEditType] = useState<'SHIPPING_FEE' | 'REFUND'>('SHIPPING_FEE');
  const [editAmountYuan, setEditAmountYuan] = useState('');
  const [editAdminNote, setEditAdminNote] = useState('');

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchTxn = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getTransactionById(id);
      setTxn(data);
      setEditType(data.type);
      setEditAmountYuan(centsToYuan(data.amountCents));
      setEditAdminNote(data.adminNote || '');
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
    const amountCents = parseYuanToCents(editAmountYuan);
    if (amountCents <= 0) { setActionError('金额必须大于 0'); return; }
    setSaving(true); setActionMsg(''); setActionError('');
    try {
      const updated = await adminApi.updateTransaction(id, {
        type: editType,
        amountCents,
        adminNote: editAdminNote || undefined,
      });
      setTxn(updated);
      setActionMsg('保存成功');
    } catch (err) {
      setActionError(err instanceof ApiError ? `${err.message}${err.requestId ? ` (${err.requestId})` : ''}` : '保存失败');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleteError('');
    try {
      await adminApi.hardDeleteTransaction(id);
      router.push('/admin/transactions');
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

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/transactions" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">交易记录详情</h1>
            <p className="text-sm text-muted-foreground font-mono">{txn.id.slice(0, 8)}...</p>
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
            <div><span className="text-muted-foreground">类型：</span>{TRANSACTION_TYPE_LABELS[txn.type] || txn.type}</div>
            <div><span className="text-muted-foreground">金额：</span><span className="font-mono font-semibold">{formatAmountCents(txn.amountCents)}</span></div>
            <div><span className="text-muted-foreground">客户：</span><span className="font-mono text-xs">{txn.customer?.customerCode || txn.customerId.slice(0, 8)}</span></div>
            <div><span className="text-muted-foreground">集运单：</span><span className="font-mono text-xs">{txn.customerShipment?.shipmentNo || txn.customerShipmentId.slice(0, 8)}</span></div>
            <div><span className="text-muted-foreground">发生时间：</span>{new Date(txn.occurredAt).toLocaleString('zh-CN')}</div>
            <div><span className="text-muted-foreground">创建时间：</span>{new Date(txn.createdAt).toLocaleString('zh-CN')}</div>
          </div>
          {txn.adminNote && <p className="text-sm"><span className="text-muted-foreground">备注：</span>{txn.adminNote}</p>}
        </div>

        {/* Edit */}
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">编辑</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">类型</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value as 'SHIPPING_FEE' | 'REFUND')} className="w-full px-3 py-2 rounded-md border text-sm">
                  {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">金额（元）</label>
                <input type="text" value={editAmountYuan} onChange={(e) => setEditAmountYuan(e.target.value)} className="w-full px-3 py-2 rounded-md border text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">管理员备注</label>
              <textarea value={editAdminNote} onChange={(e) => setEditAdminNote(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-md border text-sm" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 w-full sm:w-auto">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-200 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">永久删除此交易记录，此操作不可恢复。</p>
          <button onClick={() => setShowDelete(true)} disabled={saving} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
            永久删除
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeleteError(''); }}
        onConfirm={handleDelete}
        title="永久删除交易记录"
        description="删除后此交易记录数据将不可恢复。"
        confirmText="DELETE"
        entityLabel={`${TRANSACTION_TYPE_LABELS[txn.type] || txn.type} ${formatAmountCents(txn.amountCents)}`}
        error={deleteError}
      />
    </div>
  );
}
