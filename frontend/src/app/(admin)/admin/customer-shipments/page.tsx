'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { CustomerShipment } from '@/types/admin';
import { ImagePicker, LocalImageList } from '@/components/admin/ImageManager';
import { Pagination } from '@/components/common/Pagination';
import { CustomerShipmentStatusBadge, PaymentStatusBadge } from '@/components/common/StatusBadge';
import { CUSTOMER_SHIPMENT_STATUS_OPTIONS } from '@/lib/constants/status';

function generateDefaultNotes(customerCode: string): string {
  const now = new Date();
  const cnTime = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now).replace(/\//g, '/');
  const usTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3/$1/$2');
  return `${customerCode || '???'}于中国时间：${cnTime}；美国西部时间：${usTime}出单。`;
}

export default function CustomerShipmentsPage() {
  const router = useRouter();
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
    customerCode: '', quantity: '1', notes: '',
    actualWeightKg: '', volumeFormula: '', billingRateCnyPerKg: '', billingWeightKg: '',
  });
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [notesManuallyEdited, setNotesManuallyEdited] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Auto-generate default notes when customerCode changes (unless manually edited)
  const handleCustomerCodeChange = (value: string) => {
    const normalized = value.toUpperCase();
    setCreateForm(f => {
      const updated = { ...f, customerCode: normalized };
      if (!notesManuallyEdited) {
        updated.notes = generateDefaultNotes(normalized.trim());
      }
      return updated;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number(createForm.quantity);
    if (!createForm.customerCode.trim()) {
      setCreateError('客户编号不能为空');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setCreateError('件数必须是大于等于 1 的整数');
      return;
    }
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const matchedCustomers = await adminApi.listCustomers({ q: createForm.customerCode.trim(), page: 1, pageSize: 10 });
      const matchedCustomer = matchedCustomers.items.find(c => c.customerCode === createForm.customerCode.trim());
      if (!matchedCustomer) {
        setCreateError('客户编号不存在，请确认后重试。');
        return;
      }
      const shipment = await adminApi.createCustomerShipment({
        customerId: matchedCustomer.id,
        quantity,
        notes: createForm.notes.trim() || undefined,
        actualWeightKg: createForm.actualWeightKg ? Number(createForm.actualWeightKg) : undefined,
        volumeFormula: createForm.volumeFormula.trim() || undefined,
        billingRateCnyPerKg: createForm.billingRateCnyPerKg ? Number(createForm.billingRateCnyPerKg) : undefined,
        billingWeightKg: createForm.billingWeightKg ? Number(createForm.billingWeightKg) : undefined,
      });

      // Upload images if any
      if (localFiles.length > 0) {
        let failCount = 0;
        for (const file of localFiles) {
          try {
            await adminApi.uploadCustomerShipmentImage(shipment.id, file);
          } catch {
            failCount++;
          }
        }
        if (failCount > 0) {
          setCreateSuccess(`集运单已创建，但 ${failCount} 张图片上传失败，请在详情页继续上传`);
          setLocalFiles([]);
          setCreateForm({ customerCode: '', quantity: '1', notes: '', actualWeightKg: '', volumeFormula: '', billingRateCnyPerKg: '', billingWeightKg: '' });
          setNotesManuallyEdited(false);
          setTimeout(() => router.push(`/admin/customer-shipments/${shipment.id}`), 1500);
          return;
        }
      }

      setCreateSuccess(`集运单创建成功，单号：${shipment.shipmentNo}` + (localFiles.length > 0 ? `，已上传 ${localFiles.length} 张图片` : ''));
      setCreateForm({ customerCode: '', quantity: '1', notes: '', actualWeightKg: '', volumeFormula: '', billingRateCnyPerKg: '', billingWeightKg: '' });
      setLocalFiles([]);
      setNotesManuallyEdited(false);
      fetchData();
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

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">客户集运单</h1>
          <p className="text-sm text-muted-foreground">管理客户集运单与发货状态</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateError(''); setCreateSuccess(''); }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          新建集运单
        </button>
      </header>

      <div className="p-4 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索集运单号、客户编号..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="">全部状态</option>
            {CUSTOMER_SHIPMENT_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 rounded-md border bg-background text-sm hover:bg-muted">搜索</button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            <p>{error}</p>
            {errorRequestId && <p className="mt-1 text-xs text-red-500">Request ID: {errorRequestId}</p>}
            <button onClick={fetchData} className="mt-2 text-xs underline">重试</button>
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
                      <td className="px-4 py-3 font-mono text-xs">{s.shipmentNo}</td>
                      <td className="px-4 py-3 text-xs">{s.customer?.customerCode || '-'}</td>
                      <td className="px-4 py-3 text-xs">{s.quantity || 1}</td>
                      <td className="px-4 py-3"><CustomerShipmentStatusBadge status={s.status} /></td>
                      <td className="px-4 py-3"><PaymentStatusBadge status={s.paymentStatus} /></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(s.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/customer-shipments/${s.id}`} className="text-primary text-xs hover:underline">查看/编辑</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {shipments.map((s) => (
                <Link key={s.id} href={`/admin/customer-shipments/${s.id}`} className="block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{s.shipmentNo}</span>
                    <CustomerShipmentStatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{s.customer?.customerCode || '-'} · {s.quantity || 1} 件</span>
                    <PaymentStatusBadge status={s.paymentStatus} />
                  </div>
                </Link>
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
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            {createSuccess && <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}
            {createError && <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{createError}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">客户编号 *</label>
                <input type="text" value={createForm.customerCode} onChange={(e) => handleCustomerCodeChange(e.target.value)} placeholder="例如 GJ3178" className="w-full px-3 py-2 rounded-md border bg-background text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">件数 *</label>
                <input type="number" min={1} step={1} value={createForm.quantity} onChange={(e) => setCreateForm(f => ({ ...f, quantity: e.target.value }))} placeholder="例如 3" className="w-full px-3 py-2 rounded-md border bg-background text-sm" required />
              </div>

              {/* Billing fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">实际体重</label>
                  <div className="flex">
                    <input type="number" step="0.01" value={createForm.actualWeightKg} onChange={(e) => setCreateForm(f => ({ ...f, actualWeightKg: e.target.value }))} placeholder="例如 2" className="w-full px-3 py-2 rounded-l-md border bg-background text-sm" />
                    <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-xs text-muted-foreground">kg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">计费重量</label>
                  <div className="flex">
                    <input type="number" step="0.01" value={createForm.billingWeightKg} onChange={(e) => setCreateForm(f => ({ ...f, billingWeightKg: e.target.value }))} placeholder="例如 3" className="w-full px-3 py-2 rounded-l-md border bg-background text-sm" />
                    <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-xs text-muted-foreground">kg</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">体积</label>
                <input type="text" value={createForm.volumeFormula} onChange={(e) => setCreateForm(f => ({ ...f, volumeFormula: e.target.value }))} placeholder="例如 35*28*13/5000=2.548" className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">计费基础</label>
                <div className="flex">
                  <span className="inline-flex items-center px-2 bg-muted border border-r-0 rounded-l-md text-xs text-muted-foreground">¥</span>
                  <input type="number" step="0.01" value={createForm.billingRateCnyPerKg} onChange={(e) => setCreateForm(f => ({ ...f, billingRateCnyPerKg: e.target.value }))} placeholder="例如 80" className="w-full px-3 py-2 border bg-background text-sm" />
                  <span className="inline-flex items-center px-2 bg-muted border border-l-0 rounded-r-md text-xs text-muted-foreground">/kg</span>
                </div>
              </div>
              {createForm.billingRateCnyPerKg && createForm.billingWeightKg && (
                <p className="text-sm font-medium text-primary">预估费用：¥{(Number(createForm.billingRateCnyPerKg) * Number(createForm.billingWeightKg)).toFixed(2)}</p>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1">备注</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => { setNotesManuallyEdited(true); setCreateForm(f => ({ ...f, notes: e.target.value })); }}
                  rows={3}
                  placeholder="备注（填写客户编号后自动生成）"
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-medium mb-1">图片</label>
                <ImagePicker onSelect={(files) => setLocalFiles(prev => [...prev, ...files])} disabled={creating} />
                <LocalImageList files={localFiles} onRemove={(i) => setLocalFiles(prev => prev.filter((_, idx) => idx !== i))} />
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-md border text-sm hover:bg-muted">取消</button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
