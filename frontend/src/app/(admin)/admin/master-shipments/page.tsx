'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Loader2, Eye, X as XIcon, Check } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { MasterShipment, CustomerShipment } from '@/types/admin';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { MasterShipmentStatusBadge } from '@/components/common/StatusBadge';
import { MASTER_SHIPMENT_STATUS_LABELS } from '@/lib/constants/status';
import { safeShortId } from '@/lib/api/unwrap';
import { MASTER_SHIPMENT_TYPE_OPTIONS, formatMasterShipmentType, type MasterShipmentType } from '@/lib/master-shipment-types';

export default function MasterShipmentsPage() {
  const [shipments, setShipments] = useState<MasterShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [publicFilter, setPublicFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    shipmentType: 'AIR_GENERAL' as MasterShipmentType,
    vendorName: '',
    vendorTrackingNo: '',
    adminNote: '',
  });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Customer shipment selector
  const [selectedCsIds, setSelectedCsIds] = useState<string[]>([]);
  const [unbatchedShipments, setUnbatchedShipments] = useState<CustomerShipment[]>([]);
  const [csSearch, setCsSearch] = useState('');
  const [csLoading, setCsLoading] = useState(false);

  const resetCreateForm = () => {
    setCreateForm({ shipmentType: 'AIR_GENERAL', vendorName: '', vendorTrackingNo: '', adminNote: '' });
    setSelectedCsIds([]);
    setCsSearch('');
    setCreateError('');
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getMasterShipments({
        q: search || undefined,
        status: statusFilter || undefined,
        publicVisible: publicFilter === '' ? undefined : publicFilter === 'true',
        page,
        pageSize: 20,
      });
      setShipments(data?.items || []);
      setTotalPages(data?.totalPages || data?.pagination?.totalPages || 1);
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
  }, [search, statusFilter, publicFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const fetchUnbatchedShipments = useCallback(async () => {
    setCsLoading(true);
    try {
      const data = await adminApi.getCustomerShipments({
        unbatched: true,
        pageSize: 200,
      });
      setUnbatchedShipments(data?.items || []);
    } catch {
      // silently fail — user can still type IDs
    } finally {
      setCsLoading(false);
    }
  }, []);

  const toggleCsSelection = (id: string) => {
    setSelectedCsIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredUnbatched = unbatchedShipments.filter((s) => {
    if (!csSearch) return true;
    const q = csSearch.toLowerCase();
    return (s.shipmentNo || '').toLowerCase().includes(q) || (s.customer?.customerCode || '').toLowerCase().includes(q);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.vendorName.trim() || !createForm.vendorTrackingNo.trim()) {
      setCreateError('物流商名称和物流商运单号为必填项');
      return;
    }
    if (selectedCsIds.length === 0) {
      setCreateError('请至少选择一个客户集运单');
      return;
    }
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const result = await adminApi.createMasterShipment({
        shipmentType: createForm.shipmentType,
        vendorName: createForm.vendorName,
        vendorTrackingNo: createForm.vendorTrackingNo,
        customerShipmentIds: selectedCsIds,
        adminNote: createForm.adminNote || undefined,
      });
      setCreateSuccess(`创建成功！批次号：${result.batchNo}，包含 ${selectedCsIds.length} 个集运单`);
      resetCreateForm();
      setShowCreate(false);
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
          <h1 className="text-xl md:text-2xl font-bold">国际批次管理</h1>
          <p className="text-sm text-muted-foreground">管理国际运输批次</p>
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
          新建批次
        </button>
      </header>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b font-semibold">新建国际批次</div>
            <form onSubmit={handleCreate} className="p-4 space-y-3 overflow-y-auto flex-1">
              {createSuccess && <div className="p-2 rounded bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}
              {createError && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm break-all">{createError}</div>}
              <div>
                <label className="block text-xs font-medium mb-1">类型 *</label>
                <select
                  value={createForm.shipmentType}
                  onChange={(e) => setCreateForm((f) => ({ ...f, shipmentType: e.target.value as MasterShipmentType }))}
                  className="w-full px-3 py-2 rounded-md border text-sm"
                  required
                >
                  {MASTER_SHIPMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">供应商名称 *</label>
                <input type="text" value={createForm.vendorName} onChange={(e) => setCreateForm((f) => ({ ...f, vendorName: e.target.value }))} className="w-full px-3 py-2 rounded-md border text-sm" required placeholder="如：顺丰国际" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">供应商单号 *</label>
                <input
                  type="text"
                  value={createForm.vendorTrackingNo}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      vendorTrackingNo: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-md border text-sm"
                  required
                  placeholder="必填"
                />
              </div>

              {/* Customer Shipment Multi-Select */}
              <div>
                <label className="block text-xs font-medium mb-1">客户集运单 * ({selectedCsIds.length} 已选)</label>
                {selectedCsIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedCsIds.map((csId) => {
                      const cs = unbatchedShipments.find((s) => s.id === csId);
                      return (
                        <span key={csId} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                          {cs?.shipmentNo || safeShortId(csId)}
                          <button type="button" onClick={() => toggleCsSelection(csId)} className="hover:text-red-600">
                            <XIcon className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={csSearch}
                    onChange={(e) => setCsSearch(e.target.value)}
                    placeholder="搜索集运单号或客户编号..."
                    className="w-full pl-8 pr-3 py-2 rounded-md border text-sm"
                    onFocus={() => {
                      if (unbatchedShipments.length === 0) fetchUnbatchedShipments();
                    }}
                  />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-md border">
                  {csLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredUnbatched.length === 0 ? (
                    <p className="text-center py-3 text-xs text-muted-foreground">{unbatchedShipments.length === 0 ? '点击搜索框加载未归批集运单' : '无匹配结果'}</p>
                  ) : (
                    <ul className="divide-y">
                      {filteredUnbatched.map((cs) => {
                        const selected = selectedCsIds.includes(cs.id);
                        return (
                          <li key={cs.id}>
                            <button type="button" onClick={() => toggleCsSelection(cs.id)} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors ${selected ? 'bg-primary/5' : ''}`}>
                              <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${selected ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>{selected && <Check className="h-3 w-3" />}</span>
                              <span className="font-mono text-xs">{cs.shipmentNo || safeShortId(cs.id)}</span>
                              <span className="text-xs text-muted-foreground">{cs.customer?.customerCode || ''}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">管理员备注</label>
                <textarea value={createForm.adminNote} onChange={(e) => setCreateForm((f) => ({ ...f, adminNote: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-md border text-sm" placeholder="可选" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
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

      <div className="p-4 md:p-6">
        {createSuccess && <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索批次号/供应商/运单号..." className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm" />
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
            {Object.entries(MASTER_SHIPMENT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={publicFilter}
            onChange={(e) => {
              setPublicFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            <option value="">全部公开状态</option>
            <option value="true">已公开</option>
            <option value="false">未公开</option>
          </select>
        </form>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            <p>{error}</p>
            {errorRequestId && <p className="mt-1 text-xs">Request ID: {errorRequestId}</p>}
            <button onClick={fetchData} className="mt-2 text-xs underline">
              重试
            </button>
          </div>
        )}

        {!isLoading && !error && shipments.length === 0 && <EmptyState title="暂无国际批次" description="点击新建批次开始" />}

        {!isLoading && !error && shipments.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">批次号</th>
                    <th className="text-left px-4 py-3 font-medium">类型</th>
                    <th className="text-left px-4 py-3 font-medium">供应商</th>
                    <th className="text-left px-4 py-3 font-medium">供应商单号</th>
                    <th className="text-left px-4 py-3 font-medium">状态</th>
                    <th className="text-left px-4 py-3 font-medium">公开</th>
                    <th className="text-left px-4 py-3 font-medium">更新时间</th>
                    <th className="text-left px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{s.batchNo}</td>
                      <td className="px-4 py-3 text-xs">{formatMasterShipmentType(s.shipmentType)}</td>
                      <td className="px-4 py-3">{s.vendorName || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.vendorTrackingNo || '-'}</td>
                      <td className="px-4 py-3">
                        <MasterShipmentStatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${s.publicVisible ? 'text-green-600' : 'text-muted-foreground'}`}>{s.publicVisible ? '已公开' : '未公开'}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('zh-CN') : '-'}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/master-shipments/${s.id}`} className="text-primary hover:underline text-xs inline-flex items-center gap-1">
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
              {shipments.map((s) => (
                <Link key={s.id} href={`/admin/master-shipments/${s.id}`} className="block p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{s.batchNo}</span>
                    <MasterShipmentStatusBadge status={s.status} />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>类型：{formatMasterShipmentType(s.shipmentType)}</p>
                    <p>供应商：{s.vendorName || '-'}</p>
                    <div className="flex justify-between">
                      <span className={s.publicVisible ? 'text-green-600' : ''}>{s.publicVisible ? '已公开' : '未公开'}</span>
                      <span className="text-xs">{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('zh-CN') : ''}</span>
                    </div>
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
