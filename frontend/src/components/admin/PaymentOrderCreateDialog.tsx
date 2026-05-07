'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { yuanStringToCents } from '@/lib/admin/payment-order';
import { formatShipmentType } from '@/lib/shipment-types';

export type PaymentOrderCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCustomerShipmentId?: string;
  defaultShipmentNo?: string;
  defaultAmountYuan?: string;
  defaultShipmentType?: string | null;
  lockCustomerShipment?: boolean;
  onCreated?: () => void | Promise<void>;
};

export function PaymentOrderCreateDialog({
  open,
  onOpenChange,
  defaultCustomerShipmentId,
  defaultShipmentNo,
  defaultAmountYuan,
  defaultShipmentType,
  lockCustomerShipment = false,
  onCreated,
}: PaymentOrderCreateDialogProps) {
  const [customerShipmentId, setCustomerShipmentId] = useState('');
  const [amountYuan, setAmountYuan] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const shipmentDisplay = defaultShipmentNo?.trim() || (lockCustomerShipment ? '未生成' : '');
  const amountCents = yuanStringToCents(amountYuan);
  const canCreate = amountCents != null;

  useEffect(() => {
    if (!open) return;
    setCustomerShipmentId(defaultCustomerShipmentId || '');
    setAmountYuan(defaultAmountYuan || '');
    setAdminNote('');
    setError('');
  }, [defaultAmountYuan, defaultCustomerShipmentId, open]);

  if (!open) return null;

  const resetForm = () => {
    setCustomerShipmentId(defaultCustomerShipmentId || '');
    setAmountYuan(defaultAmountYuan || '');
    setAdminNote('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const shipmentId = customerShipmentId.trim();
    if (!shipmentId) {
      setError('集运单号对应的内部记录缺失，无法创建订单');
      return;
    }
    if (amountCents == null) {
      setError('金额无法自动计算，请先编辑集运单的计费重量和计费基础。');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await adminApi.createTransaction({
        customerShipmentId: shipmentId,
        amountCents,
        adminNote: adminNote.trim() || undefined,
      });
      resetForm();
      onOpenChange(false);
      await onCreated?.();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setError('创建失败');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">新建订单</h2>
          <button
            type="button"
            onClick={() => {
              if (!creating) onOpenChange(false);
            }}
            disabled={creating}
            className="text-muted-foreground hover:text-foreground p-1 disabled:opacity-50"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm break-all">{error}</div>}
          {lockCustomerShipment ? (
            <div>
              <span className="block text-xs font-medium mb-1">集运单号</span>
              <div className="w-full rounded-md border bg-muted px-3 py-2 text-sm font-mono text-muted-foreground">
                {shipmentDisplay}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium mb-1">集运单号 *</label>
              <input
                type="text"
                value={customerShipmentId}
                onChange={(e) => setCustomerShipmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm font-mono disabled:bg-muted disabled:text-muted-foreground"
                required
                disabled={creating}
              />
            </div>
          )}
          <div>
            <span className="block text-xs font-medium mb-1">运输类型</span>
            <div className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {formatShipmentType(defaultShipmentType)}
            </div>
          </div>
          <div>
            <span className="block text-xs font-medium mb-1">金额</span>
            {canCreate ? (
              <div className="w-full rounded-md border bg-muted px-3 py-2 text-sm font-mono text-muted-foreground">
                ¥{Number(amountYuan).toFixed(2)}
              </div>
            ) : (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                金额无法自动计算，请先编辑集运单的计费重量和计费基础。
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">备注</label>
            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-md border text-sm" placeholder="可选" disabled={creating} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => onOpenChange(false)} disabled={creating} className="px-4 py-2 rounded-md border text-sm hover:bg-muted disabled:opacity-50">
              取消
            </button>
            <button type="submit" disabled={creating || !canCreate} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
