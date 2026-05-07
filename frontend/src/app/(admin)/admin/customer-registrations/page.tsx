'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Loader2, X } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { CustomerRegistration } from '@/types/admin';
import { Pagination } from '@/components/common/Pagination';
import { CUSTOMER_REGISTRATION_STATUS_LABELS, CUSTOMER_REGISTRATION_STATUS_COLORS } from '@/lib/constants/status';
import { cn } from '@/lib/utils';

export default function CustomerRegistrationsPage() {
  const [items, setItems] = useState<CustomerRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ phoneCountryCode: '+86', phoneNumber: '', wechatId: '', domesticReturnAddress: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    const notice = window.sessionStorage.getItem('gjx_admin_notice');
    if (notice) {
      setCreateSuccess(notice);
      window.sessionStorage.removeItem('gjx_admin_notice');
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getCustomerRegistrations({ q: search || undefined, status: statusFilter || undefined, page, pageSize: 20 });
      setItems(data?.items || []);
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
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.phoneNumber.trim()) {
      setCreateError('手机号不能为空');
      return;
    }
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const reg = await adminApi.createCustomerRegistration({
        phoneCountryCode: createForm.phoneCountryCode,
        phoneNumber: createForm.phoneNumber.trim(),
        wechatId: createForm.wechatId.trim() || undefined,
        domesticReturnAddress: createForm.domesticReturnAddress.trim() || undefined,
      });
      setCreateSuccess(`申请已创建，客户编号：${reg.customerCode}`);
      setCreateForm({ phoneCountryCode: '+86', phoneNumber: '', wechatId: '', domesticReturnAddress: '' });
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
          <h1 className="text-xl md:text-2xl font-bold">新客户审核</h1>
          <p className="text-sm text-muted-foreground">管理客户注册申请</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateError(''); setCreateSuccess(''); }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          新建申请
        </button>
      </header>

      <div className="p-4 md:p-6">
        {createSuccess && !showCreate && (
          <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
            {createSuccess}
          </div>
        )}

        {/* Search + Filter */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索客户编号、手机号、微信号"
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="">全部状态</option>
            <option value="PENDING">待审核</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-md border bg-background text-sm hover:bg-muted">
            搜索
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            <p>{error}</p>
            {errorRequestId && <p className="mt-1 text-xs text-red-500 break-all">Request ID: {errorRequestId}</p>}
            <button onClick={fetchData} className="mt-2 text-xs underline">重试</button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">暂无注册申请</p>
            <p className="text-sm mt-1">等待新客户提交注册信息</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && items.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">客户编号</th>
                    <th className="text-left px-4 py-3 font-medium">手机号</th>
                    <th className="text-left px-4 py-3 font-medium">微信号</th>
                    <th className="text-left px-4 py-3 font-medium">国内退货地址</th>
                    <th className="text-left px-4 py-3 font-medium">状态</th>
                    <th className="text-left px-4 py-3 font-medium">提交时间</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{r.customerCode}</td>
                      <td className="px-4 py-3">{r.phoneCountryCode} {r.phoneNumber}</td>
                      <td className="px-4 py-3">{r.wechatId || '-'}</td>
                      <td className="px-4 py-3 max-w-[140px] truncate text-xs text-muted-foreground" title={r.domesticReturnAddress || ''}>{r.domesticReturnAddress || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', CUSTOMER_REGISTRATION_STATUS_COLORS[r.status || ''] || 'bg-gray-100 text-gray-700')}>
                          {CUSTOMER_REGISTRATION_STATUS_LABELS[r.status || ''] || r.status || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(r.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/customer-registrations/${r.id}`} className="text-primary text-xs hover:underline">
                          审核
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {items.map((r) => (
                <Link key={r.id} href={`/admin/customer-registrations/${r.id}`} className="block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-medium">{r.customerCode}</span>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', CUSTOMER_REGISTRATION_STATUS_COLORS[r.status || ''] || 'bg-gray-100 text-gray-700')}>
                      {CUSTOMER_REGISTRATION_STATUS_LABELS[r.status || ''] || r.status || '-'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>{r.phoneCountryCode} {r.phoneNumber}</p>
                    {r.wechatId && <p>微信：{r.wechatId}</p>}
                    {r.domesticReturnAddress && <p className="truncate">地址：{r.domesticReturnAddress}</p>}
                    <p className="text-xs">{new Date(r.createdAt).toLocaleDateString('zh-CN')}</p>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">新建注册申请</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createSuccess && (
              <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>
            )}
            {createError && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm break-all">{createError}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-2">
                <div className="w-24">
                  <label className="block text-xs font-medium mb-1">区号</label>
                  <select
                    value={createForm.phoneCountryCode}
                    onChange={(e) => setCreateForm(f => ({ ...f, phoneCountryCode: e.target.value }))}
                    className="w-full px-2 py-2 rounded-md border bg-background text-sm"
                  >
                    <option value="+86">+86</option>
                    <option value="+1">+1</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">手机号 *</label>
                  <input
                    type="text"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    placeholder="输入手机号"
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">微信号</label>
                <input
                  type="text"
                  value={createForm.wechatId}
                  onChange={(e) => setCreateForm(f => ({ ...f, wechatId: e.target.value }))}
                  placeholder="可选"
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">国内退货地址</label>
                <textarea
                  value={createForm.domesticReturnAddress}
                  onChange={(e) => setCreateForm(f => ({ ...f, domesticReturnAddress: e.target.value }))}
                  placeholder="可选"
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-md border text-sm hover:bg-muted">
                  取消
                </button>
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
