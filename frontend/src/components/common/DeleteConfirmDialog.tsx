'use client';

import { useState } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  entityLabel?: string;
  blockers?: Record<string, number>;
  error?: string;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '永久删除',
  description = '此操作不可恢复。删除后数据将被永久移除。',
  confirmText = 'DELETE',
  entityLabel,
  blockers,
  error,
}: DeleteConfirmDialogProps) {
  const [input, setInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const canDelete = input === confirmText;

  const handleConfirm = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      setInput('');
    }
  };

  const handleClose = () => {
    setInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          {entityLabel && (
            <p className="text-sm">
              即将删除：<span className="font-mono font-semibold text-red-700">{entityLabel}</span>
            </p>
          )}

          {blockers && Object.keys(blockers).length > 0 && (
            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm">
              <p className="font-medium text-yellow-800 mb-1">无法删除：存在关联记录</p>
              <ul className="text-yellow-700 space-y-0.5">
                {blockers.inboundPackages != null && blockers.inboundPackages > 0 && (
                  <li>入库包裹：{blockers.inboundPackages} 条</li>
                )}
                {blockers.customerShipments != null && blockers.customerShipments > 0 && (
                  <li>客户集运单：{blockers.customerShipments} 条</li>
                )}
                {blockers.transactions != null && blockers.transactions > 0 && (
                  <li>交易记录：{blockers.transactions} 条</li>
                )}
              </ul>
              <p className="mt-2 text-yellow-600 text-xs">请先移除关联记录后再删除。</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm break-all">
              {error}
            </div>
          )}

          {!blockers || Object.keys(blockers).length === 0 ? (
            <>
              <div>
                <label className="block text-xs font-medium mb-1">
                  请输入 <span className="font-mono font-bold text-red-600">{confirmText}</span> 确认删除
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={confirmText}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm font-mono"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canDelete || deleting}
                  className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                  永久删除
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
              >
                关闭
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
