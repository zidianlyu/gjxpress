'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Loader2, X } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { Customer } from '@/types/admin';
import { Pagination } from '@/components/common/Pagination';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ phoneCountryCode: '+86', phoneNumber: '', wechatId: '', domesticReturnAddress: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.listCustomers({ q: search.trim() || undefined, page, pageSize: 20 });
      setCustomers(data?.items || []);
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
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
      const customer = await adminApi.createCustomer({
        phoneCountryCode: createForm.phoneCountryCode,
        phoneNumber: createForm.phoneNumber.trim(),
        wechatId: createForm.wechatId.trim() || undefined,
        domesticReturnAddress: createForm.domesticReturnAddress.trim() || undefined,
      });
      setCreateSuccess(`客户创建成功，客户编号：${customer.customerCode}`);
      setCreateForm({ phoneCountryCode: '+86', phoneNumber: '', wechatId: '', domesticReturnAddress: '' });
      setShowCreate(false);
      fetchCustomers();
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
          <h1 className="text-xl md:text-2xl font-bold">客户管理</h1>
          <p className="text-sm text-muted-foreground">管理客户信息</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateError(''); setCreateSuccess(''); }}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          新建客户
        </button>
      </header>

      <div className="p-4 md:p-6">
        {createSuccess && (
          <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
            <p>{createSuccess}</p>
            <p className="text-xs mt-1 text-green-600">客户编号用于包裹归属，不是登录密码。</p>
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
              placeholder="搜索客户编号、手机号或微信号..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-md border bg-background text-sm hover:bg-muted">
            搜索
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            <p>{error}</p>
            {errorRequestId && <p className="mt-1 text-xs text-red-500">Request ID: {errorRequestId}</p>}
            <button onClick={fetchCustomers} className="mt-2 text-xs underline">重试</button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && customers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">暂无客户</p>
            <p className="text-sm mt-1">点击右上角新建客户</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && customers.length > 0 && (
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
                    <th className="text-left px-4 py-3 font-medium">创建时间</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{c.customerCode}</td>
                      <td className="px-4 py-3">{c.phoneCountryCode} {c.phoneNumber}</td>
                      <td className="px-4 py-3">{c.wechatId || '-'}</td>
                      <td className="px-4 py-3 max-w-[160px] truncate text-xs text-muted-foreground" title={c.domesticReturnAddress || ''}>{c.domesticReturnAddress || '-'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/customers/${c.id}`} className="text-primary text-xs hover:underline">
                          查看/编辑
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {customers.map((c) => (
                <Link key={c.id} href={`/admin/customers/${c.id}`} className="block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <div className="mb-1">
                    <span className="font-mono text-sm font-medium">{c.customerCode}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>{c.phoneCountryCode} {c.phoneNumber}</p>
                    {c.wechatId && <p>微信：{c.wechatId}</p>}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">新建客户</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{createError}</div>
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
