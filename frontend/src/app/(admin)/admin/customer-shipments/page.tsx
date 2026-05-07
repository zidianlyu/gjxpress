'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Loader2, X } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { CustomerShipment } from '@/types/admin';
import { ImagePicker, LocalImageList } from '@/components/admin/ImageManager';
import { PaymentOrderCreateDialog } from '@/components/admin/PaymentOrderCreateDialog';
import { AdminBlockingOverlay } from '@/components/admin/AdminBlockingOverlay';
import { Pagination } from '@/components/common/Pagination';
import { CustomerShipmentStatusBadge, PaymentStatusBadge } from '@/components/common/StatusBadge';
import { CUSTOMER_SHIPMENT_STATUS_OPTIONS } from '@/lib/constants/status';
import { CustomerCodeInput, isCustomerCodeComplete } from '@/components/admin/CustomerCodeInput';
import { buildDefaultShipmentNotes, ensurePayableAmountLine, formatPayableAmount, isPositiveDecimalString, sanitizeDecimalString } from '@/lib/admin/customer-shipment-form';
import { computeShipmentPayableAmountYuan, isUnpaidShipment } from '@/lib/admin/payment-order';
import { getEntityId, safeShortId } from '@/lib/api/unwrap';

export default function CustomerShipmentsPage() {
  const [shipments, setShipments] = useState<CustomerShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerCode: '',
    quantity: '1',
    notes: '',
    actualWeightKg: '',
    volumeFormula: '',
    billingRateCnyPerKg: '',
    billingWeightKg: '',
  });
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [notesManuallyEdited, setNotesManuallyEdited] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createBlockingText, setCreateBlockingText] = useState('正在创建记录...');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [paymentDialogShipment, setPaymentDialogShipment] = useState<CustomerShipment | null>(null);
  const payableText = formatPayableAmount(createForm.billingRateCnyPerKg, createForm.billingWeightKg) || '待确认';
  const paymentDialogAmount = paymentDialogShipment ? computeShipmentPayableAmountYuan(paymentDialogShipment) : null;

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('zh-CN');
  };

  const resetCreateForm = () => {
    setCreateForm({
      customerCode: '',
      quantity: '1',
      notes: '',
      actualWeightKg: '',
      volumeFormula: '',
      billingRateCnyPerKg: '',
      billingWeightKg: '',
    });
    setLocalFiles([]);
    setNotesManuallyEdited(false);
    setCreateError('');
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.listCustomerShipments({
        q: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        pageSize: 20,
      });
      setShipments(data?.items || []);
      setTotalPages(data?.totalPages || 1);
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
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  useEffect(() => {
    if (notesManuallyEdited) return;
    setCreateForm((f) => ({
      ...f,
      notes: buildDefaultShipmentNotes(f.customerCode.trim(), payableText),
    }));
  }, [notesManuallyEdited, payableText]);

  const handleCustomerCodeChange = (value: string) => {
    const normalized = value.toUpperCase();
    setCreateForm((f) => ({
      ...f,
      customerCode: normalized,
      notes: notesManuallyEdited ? f.notes : buildDefaultShipmentNotes(normalized.trim(), payableText),
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number(createForm.quantity);
    if (!isCustomerCodeComplete(createForm.customerCode)) {
      setCreateError('客户编号必须是 GJ 加 4 位数字');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setCreateError('件数必须是大于等于 1 的整数');
      return;
    }
    const actualWeightKg = sanitizeDecimalString(createForm.actualWeightKg);
    const billingRateCnyPerKg = sanitizeDecimalString(createForm.billingRateCnyPerKg);
    const billingWeightKg = sanitizeDecimalString(createForm.billingWeightKg);
    if (!isPositiveDecimalString(actualWeightKg)) {
      setCreateError('实际重量必须是大于 0 的数字，不能包含单位');
      return;
    }
    if (!isPositiveDecimalString(billingWeightKg)) {
      setCreateError('计费重量必须是大于 0 的数字，不能包含单位');
      return;
    }
    if (!isPositiveDecimalString(billingRateCnyPerKg)) {
      setCreateError('计费基础必须是大于 0 的数字，不能包含 ¥、/kg 或其他单位');
      return;
    }
    setCreating(true);
    setCreateBlockingText('正在创建记录...');
    setCreateError('');
    setCreateSuccess('');
    try {
      const trimmedCustomerCode = createForm.customerCode.trim();
      const finalNotesBase = createForm.notes.trim() || buildDefaultShipmentNotes(trimmedCustomerCode, payableText);
      const finalNotes = ensurePayableAmountLine(finalNotesBase, payableText);
      const shipment = await adminApi.createCustomerShipment({
        customerCode: trimmedCustomerCode,
        quantity,
        notes: finalNotes,
        actualWeightKg,
        volumeFormula: createForm.volumeFormula.trim() || undefined,
        billingRateCnyPerKg,
        billingWeightKg,
      });
      const shipmentId = getEntityId(shipment);

      // Upload images if any
      if (localFiles.length > 0) {
        if (!shipmentId) {
          setCreateSuccess('记录已创建但后端未返回 ID，无法上传图片，请刷新列表确认后重试。');
          setCreateBlockingText('正在刷新列表...');
          await fetchData();
          resetCreateForm();
          setShowCreate(false);
          return;
        }
        let failCount = 0;
        for (const [index, file] of localFiles.entries()) {
          setCreateBlockingText(`正在上传图片 ${index + 1} / ${localFiles.length}...`);
          try {
            await adminApi.uploadCustomerShipmentImage(shipmentId, file);
          } catch {
            failCount++;
          }
        }
        if (failCount > 0) {
          setCreateSuccess('记录已创建，部分图片上传失败，可进入详情页补传。');
          setCreateBlockingText('正在刷新列表...');
          await fetchData();
          resetCreateForm();
          setShowCreate(false);
          return;
        }
      }

      setCreateSuccess(`集运单创建成功${shipment.shipmentNo ? `，单号：${shipment.shipmentNo}` : ''}` + (localFiles.length > 0 ? `，已上传 ${localFiles.length} 张图片` : ''));
      setCreateBlockingText('正在刷新列表...');
      await fetchData();
      resetCreateForm();
      setShowCreate(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setCreateError('创建失败');
      }
    } finally {
      setCreating(false);
    }
  };

  const openPaymentDialog = (shipment: CustomerShipment) => {
    setPaymentDialogShipment(shipment);
  };

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">客户集运单</h1>
          <p className="text-sm text-muted-foreground">管理客户集运单与发货状态</p>
        </div>
          <button
          onClick={() => {
            setShowCreate(true);
            setCreateError('');
            setCreateSuccess('');
          }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          新建集运单
        </button>
      </header>

      <div className="p-4 md:p-6">
        {createSuccess && <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索集运单号、客户编号..." className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="">全部状态</option>
            {CUSTOMER_SHIPMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 rounded-md border bg-background text-sm hover:bg-muted">
            搜索
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            <p>{error}</p>
            {errorRequestId && <p className="mt-1 text-xs text-red-500">Request ID: {errorRequestId}</p>}
            <button onClick={fetchData} className="mt-2 text-xs underline">
              重试
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && !error && shipments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">暂无集运单</p>
            <p className="text-sm mt-1">点击右上角新建集运单</p>
          </div>
        )}

        {!isLoading && !error && shipments.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">集运单号</th>
                    <th className="text-left px-4 py-3 font-medium">客户</th>
                    <th className="text-left px-4 py-3 font-medium">件数</th>
                    <th className="text-left px-4 py-3 font-medium">运输状态</th>
                    <th className="text-left px-4 py-3 font-medium">费用状态</th>
                    <th className="text-left px-4 py-3 font-medium">创建时间</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{s.shipmentNo || safeShortId(s.id)}</td>
                      <td className="px-4 py-3 text-xs">{s.customer?.customerCode || '-'}</td>
                      <td className="px-4 py-3 text-xs">{s.quantity || 1}</td>
                      <td className="px-4 py-3">
                        <CustomerShipmentStatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={s.paymentStatus || ''} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(s.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/customer-shipments/${s.id}`} className="text-primary text-xs hover:underline">
                            编辑
                          </Link>
                          {isUnpaidShipment(s) && (
                            <button
                              type="button"
                              onClick={() => openPaymentDialog(s)}
                              aria-label="为该集运单入账"
                              title="新建支付订单"
                              className="text-primary text-xs hover:underline"
                            >
                              入账
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {shipments.map((s) => (
                <div key={s.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <Link href={`/admin/customer-shipments/${s.id}`} className="font-mono text-sm text-primary hover:underline">
                      {s.shipmentNo || safeShortId(s.id)}
                    </Link>
                    <CustomerShipmentStatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {s.customer?.customerCode || '-'} · {s.quantity || 1} 件
                    </span>
                    <PaymentStatusBadge status={s.paymentStatus || ''} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Link href={`/admin/customer-shipments/${s.id}`} className="text-xs text-primary hover:underline">
                      编辑
                    </Link>
                    {isUnpaidShipment(s) && (
                      <button
                        type="button"
                        onClick={() => openPaymentDialog(s)}
                        aria-label="为该集运单入账"
                        title="新建支付订单"
                        className="text-xs text-primary hover:underline"
                      >
                        入账
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">新建集运单</h2>
              <button
                type="button"
                onClick={() => {
                  if (!creating) setShowCreate(false);
                }}
                disabled={creating}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createSuccess && <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}
            {createError && <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{createError}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <CustomerCodeInput value={createForm.customerCode} onChange={handleCustomerCodeChange} required disabled={creating} />
              <div>
                <label className="block text-xs font-medium mb-1">件数 *</label>
                <input type="number" min={1} step={1} value={createForm.quantity} onChange={(e) => setCreateForm((f) => ({ ...f, quantity: e.target.value }))} placeholder="例如 3" className="w-full px-3 py-2 rounded-md border bg-background text-sm" required disabled={creating} />
              </div>

              {/* Billing fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">实际体重</label>
                  <div className="flex">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={createForm.actualWeightKg}
                      onChange={(e) =>
                        setCreateForm((f) => ({
                          ...f,
                          actualWeightKg: e.target.value,
                        }))
                      }
                      placeholder="例如 2"
                      className="w-full px-3 py-2 rounded-l-md border bg-background text-sm"
                      disabled={creating}
                    />
                    <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-xs text-muted-foreground">kg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">体积</label>
                  <input
                    type="text"
                    value={createForm.volumeFormula}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        volumeFormula: e.target.value,
                      }))
                    }
                    placeholder="例如 35*28*13/5000=2.548"
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                    disabled={creating}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">计费重量</label>
                <div className="flex">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={createForm.billingWeightKg}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        billingWeightKg: e.target.value,
                      }))
                    }
                    placeholder="例如 3"
                    className="w-full px-3 py-2 rounded-l-md border bg-background text-sm"
                    disabled={creating}
                  />
                  <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-xs text-muted-foreground">kg</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">计费基础</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2 bg-muted border border-r-0 rounded-l-md text-xs text-muted-foreground">¥</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={createForm.billingRateCnyPerKg}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        billingRateCnyPerKg: e.target.value,
                      }))
                    }
                    placeholder="例如 80"
                    className="w-full px-3 py-2 border bg-background text-sm"
                    disabled={creating}
                  />
                  <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-xs text-muted-foreground">/kg</span>
                </div>
              </div>
              <p className="text-sm font-medium text-primary">应付费用：{payableText}</p>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1">备注</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => {
                    setNotesManuallyEdited(true);
                    setCreateForm((f) => ({ ...f, notes: e.target.value }));
                  }}
                  rows={3}
                  placeholder="备注（填写客户编号后自动生成）"
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                  disabled={creating}
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-medium mb-1">图片</label>
                <ImagePicker onSelect={(files) => setLocalFiles((prev) => [...prev, ...files])} disabled={creating} />
                <LocalImageList files={localFiles} onRemove={(i) => {
                  if (!creating) setLocalFiles((prev) => prev.filter((_, idx) => idx !== i));
                }} />
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} disabled={creating} className="px-4 py-2 rounded-md border text-sm hover:bg-muted disabled:opacity-50">
                  取消
                </button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
          {creating && <AdminBlockingOverlay description={createBlockingText} />}
        </div>
      )}

      <PaymentOrderCreateDialog
        open={!!paymentDialogShipment}
        onOpenChange={(open) => {
          if (!open) setPaymentDialogShipment(null);
        }}
        defaultCustomerShipmentId={paymentDialogShipment?.id}
        defaultShipmentNo={paymentDialogShipment?.shipmentNo || undefined}
        defaultAmountYuan={paymentDialogAmount || undefined}
        defaultType="SHIPPING_FEE"
        lockCustomerShipment
        amountHelperText={paymentDialogShipment && !paymentDialogAmount ? '无法自动计算金额，请手动填写。' : undefined}
        onCreated={fetchData}
      />
    </div>
  );
}
