'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Eye, Search } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { TransactionRecord } from '@/types/admin';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { TRANSACTION_TYPE_LABELS } from '@/lib/constants/status';
import { formatAmountCents, parseYuanToCents } from '@/lib/format';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [createForm, setCreateForm] = useState({
    customerShipmentId: '',
    type: 'SHIPPING_FEE' as 'SHIPPING_FEE' | 'REFUND',
    amountYuan: '',
    adminNote: '',
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getTransactions({
        q: search || undefined,
        type: typeFilter || undefined,
        page,
        pageSize: 20,
      });
      setTransactions(data?.items || []);
      setTotalPages(data?.pagination?.totalPages || 1);
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
  }, [search, typeFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.customerShipmentId.trim()) { setCreateError('集运单 ID 为必填项'); return; }
    if (!createForm.amountYuan.trim()) { setCreateError('金额为必填项'); return; }
    const amountCents = parseYuanToCents(createForm.amountYuan);
    if (amountCents <= 0) { setCreateError('金额必须大于 0'); return; }
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      await adminApi.createTransaction({
        customerShipmentId: createForm.customerShipmentId.trim(),
        type: createForm.type,
        amountCents,
        adminNote: createForm.adminNote || undefined,
      });
      setCreateSuccess('交易记录已创建');
      setCreateForm({ customerShipmentId: '', type: 'SHIPPING_FEE', amountYuan: '', adminNote: '' });
      fetchData();
      setTimeout(() => { setShowCreate(false); setCreateSuccess(''); }, 1500);
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
          <h1 className="text-xl md:text-2xl font-bold">交易记录管理</h1>
          <p className="text-sm text-muted-foreground">管理客户运费与退款记录</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateError(''); setCreateSuccess(''); }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          新建交易
        </button>
      </header>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b font-semibold">新建交易记录</div>
            <form onSubmit={handleCreate} className="p-4 space-y-3">
              {createSuccess && <div className="p-2 rounded bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}
              {createError && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm break-all">{createError}</div>}
              <div>
                <label className="block text-xs font-medium mb-1">集运单 ID *</label>
                <input type="text" value={createForm.customerShipmentId} onChange={(e) => setCreateForm(f => ({ ...f, customerShipmentId: e.target.value }))} className="w-full px-3 py-2 rounded-md border text-sm font-mono" required />
                <p className="text-xs text-muted-foreground mt-0.5">可在集运单详情页获取 ID</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">类型</label>
                <select value={createForm.type} onChange={(e) => setCreateForm(f => ({ ...f, type: e.target.value as 'SHIPPING_FEE' | 'REFUND' }))} className="w-full px-3 py-2 rounded-md border text-sm">
                  {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">金额（元）*</label>
                <input type="text" value={createForm.amountYuan} onChange={(e) => setCreateForm(f => ({ ...f, amountYuan: e.target.value }))} placeholder="如 105.00" className="w-full px-3 py-2 rounded-md border text-sm" required />
                <p className="text-xs text-muted-foreground mt-0.5">输入人民币金额，系统自动转换为分</p>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">管理员备注</label>
                <textarea value={createForm.adminNote} onChange={(e) => setCreateForm(f => ({ ...f, adminNote: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-md border text-sm" placeholder="可选" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-md border text-sm hover:bg-muted">取消</button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索客户编号、集运单号..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="">全部类型</option>
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 rounded-md border bg-background text-sm hover:bg-muted">搜索</button>
        </form>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            <p>{error}</p>
            {errorRequestId && <p className="mt-1 text-xs break-all">Request ID: {errorRequestId}</p>}
            <button onClick={fetchData} className="mt-2 text-xs underline">重试</button>
          </div>
        )}

        {!isLoading && !error && transactions.length === 0 && (
          <EmptyState title="暂无交易记录" description="点击新建交易开始" />
        )}

        {!isLoading && !error && transactions.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">客户</th>
                    <th className="text-left px-4 py-3 font-medium">集运单</th>
                    <th className="text-left px-4 py-3 font-medium">类型</th>
                    <th className="text-left px-4 py-3 font-medium">金额</th>
                    <th className="text-left px-4 py-3 font-medium">备注</th>
                    <th className="text-left px-4 py-3 font-medium">时间</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{t.customer?.customerCode || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{t.customerShipment?.shipmentNo || '-'}</td>
                      <td className="px-4 py-3">{TRANSACTION_TYPE_LABELS[t.type] || t.type}</td>
                      <td className="px-4 py-3 font-mono">{formatAmountCents(t.amountCents)}</td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[150px]">{t.adminNote || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(t.occurredAt).toLocaleDateString('zh-CN')}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/transactions/${t.id}`} className="text-primary hover:underline text-xs inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" /> 查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {transactions.map((t) => (
                <Link key={t.id} href={`/admin/transactions/${t.id}`} className="block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{TRANSACTION_TYPE_LABELS[t.type] || t.type}</span>
                    <span className="font-mono font-semibold text-sm">{formatAmountCents(t.amountCents)}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">客户：{t.customer?.customerCode || t.customerId.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground">{new Date(t.occurredAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                    {t.customerShipment && <p className="text-muted-foreground text-xs">集运单：{t.customerShipment.shipmentNo}</p>}
                    {t.adminNote && <p className="text-muted-foreground text-xs truncate">{t.adminNote}</p>}
                  </div>
                </Link>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
          </>
        )}
      </div>
    </div>
  );
}
