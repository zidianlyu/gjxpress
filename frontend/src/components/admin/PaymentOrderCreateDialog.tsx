'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants/status';
import { type PaymentOrderType, yuanStringToCents } from '@/lib/admin/payment-order';

export type PaymentOrderCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCustomerShipmentId?: string;
  defaultShipmentNo?: string;
  defaultAmountYuan?: string;
  defaultType?: PaymentOrderType;
  lockCustomerShipment?: boolean;
  amountHelperText?: string;
  onCreated?: () => void | Promise<void>;
};

export function PaymentOrderCreateDialog({
  open,
  onOpenChange,
  defaultCustomerShipmentId,
  defaultShipmentNo,
  defaultAmountYuan,
  defaultType = 'SHIPPING_FEE',
  lockCustomerShipment = false,
  amountHelperText,
  onCreated,
}: PaymentOrderCreateDialogProps) {
  const [customerShipmentId, setCustomerShipmentId] = useState('');
  const [amountYuan, setAmountYuan] = useState('');
  const [type, setType] = useState<PaymentOrderType>(defaultType);
  const [adminNote, setAdminNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const shipmentDisplay = defaultShipmentNo?.trim() || (lockCustomerShipment ? '未生成' : '');

  useEffect(() => {
    if (!open) return;
    setCustomerShipmentId(defaultCustomerShipmentId || '');
    setAmountYuan(defaultAmountYuan || '');
    setType(defaultType);
    setAdminNote('');
    setError('');
  }, [defaultAmountYuan, defaultCustomerShipmentId, defaultType, open]);

  if (!open) return null;

  const resetForm = () => {
    setCustomerShipmentId(defaultCustomerShipmentId || '');
    setAmountYuan(defaultAmountYuan || '');
    setType(defaultType);
    setAdminNote('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const shipmentId = customerShipmentId.trim();
    if (!shipmentId) {
      setError('集运单号对应的内部记录缺失，无法创建支付订单');
      return;
    }
    const amountCents = yuanStringToCents(amountYuan);
    if (amountCents == null) {
      setError('金额必须是大于 0 的人民币金额，最多两位小数，不能包含货币符号或逗号');
      return;
    }

    setCreating(true);
    setError('');
    try {
      await adminApi.createTransaction({
        customerShipmentId: shipmentId,
        type,
        amountCents,
        adminNote: adminNote.trim() || undefined,
      });
      await onCreated?.();
      resetForm();
      onOpenChange(false);
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
          <h2 className="font-semibold">新建支付订单</h2>
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
            <label className="block text-xs font-medium mb-1">金额（元）*</label>
            <input
              type="text"
              inputMode="decimal"
              value={amountYuan}
              onChange={(e) => setAmountYuan(e.target.value)}
              placeholder="如 160 或 160.00"
              className="w-full px-3 py-2 rounded-md border text-sm"
              required
              disabled={creating}
            />
            <p className="text-xs text-muted-foreground mt-0.5">{amountHelperText || '输入人民币金额，系统自动转换为分'}</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">类型</label>
            <select value={type} onChange={(e) => setType(e.target.value as PaymentOrderType)} className="w-full px-3 py-2 rounded-md border text-sm" disabled={creating}>
              {(['SHIPPING_FEE', 'REFUND'] as PaymentOrderType[]).map((key) => (
                <option key={key} value={key}>
                  {TRANSACTION_TYPE_LABELS[key] || key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">管理员备注</label>
            <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-md border text-sm" placeholder="可选" disabled={creating} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => onOpenChange(false)} disabled={creating} className="px-4 py-2 rounded-md border text-sm hover:bg-muted disabled:opacity-50">
              取消
            </button>
            <button type="submit" disabled={creating} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-2">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
