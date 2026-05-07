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
import { AdminBlockingOverlay } from '@/components/admin/AdminBlockingOverlay';
import { safeShortId } from '@/lib/api/unwrap';
import { MASTER_SHIPMENT_VENDOR_OPTIONS, isMasterShipmentVendor, type MasterShipmentVendor } from '@/lib/master-shipment-vendors';
import { SHIPMENT_TYPE_OPTIONS, formatShipmentType, type ShipmentType } from '@/lib/shipment-types';
import { MASTER_SHIPMENT_STATUS_LABELS } from '@/lib/master-shipment-status';
import { normalizePaymentStatus } from '@/lib/customer-shipment-status';

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
    shipmentType: 'AIR_GENERAL' as ShipmentType,
    vendorName: 'DHL' as MasterShipmentVendor,
    vendorTrackingNo: '',
  });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Customer shipment selector
  const [selectedCsIds, setSelectedCsIds] = useState<string[]>([]);
  const [unbatchedShipments, setUnbatchedShipments] = useState<CustomerShipment[]>([]);
  const [csSearch, setCsSearch] = useState('');
  const [csLoading, setCsLoading] = useState(false);
  const [csFilterNotice, setCsFilterNotice] = useState('');

  const formatCustomerShipmentOption = (shipment: CustomerShipment) =>
    `${shipment.shipmentNo || '未生成单号'} ${shipment.customer?.customerCode || '未知客户'} ${formatShipmentType(shipment.shipmentType)}`;

  const resetCreateForm = () => {
    setCreateForm({ shipmentType: 'AIR_GENERAL', vendorName: 'DHL', vendorTrackingNo: '' });
    setSelectedCsIds([]);
    setCsSearch('');
    setCsFilterNotice('');
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
        publicPublished: publicFilter === '' ? undefined : publicFilter === 'true',
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

  useEffect(() => {
    const notice = window.sessionStorage.getItem('gjx_admin_notice');
    if (notice) {
      setCreateSuccess(notice);
      window.sessionStorage.removeItem('gjx_admin_notice');
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const fetchUnbatchedShipments = useCallback(async (shipmentType = createForm.shipmentType) => {
    setCsLoading(true);
    try {
      const data = await adminApi.getCustomerShipments({
        unbatched: true,
        shipmentType,
        paymentStatus: 'PAID',
        pageSize: 200,
      });
      setUnbatchedShipments(data?.items || []);
    } catch {
      // silently fail — user can still type IDs
    } finally {
      setCsLoading(false);
    }
  }, [createForm.shipmentType]);

  useEffect(() => {
    if (!showCreate) return;
    fetchUnbatchedShipments(createForm.shipmentType);
  }, [createForm.shipmentType, fetchUnbatchedShipments, showCreate]);

  const toggleCsSelection = (id: string) => {
    setSelectedCsIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredUnbatched = unbatchedShipments.filter((s) => {
    if (s.masterShipmentId) return false;
    if (s.shipmentType && s.shipmentType !== createForm.shipmentType) return false;
    if (normalizePaymentStatus(s.paymentStatus) !== 'PAID') return false;
    if (!csSearch) return true;
    const q = csSearch.toLowerCase();
    return (s.shipmentNo || '').toLowerCase().includes(q) || (s.customer?.customerCode || '').toLowerCase().includes(q);
  });

  const handleShipmentTypeChange = (shipmentType: ShipmentType) => {
    setCreateForm((f) => ({ ...f, shipmentType }));
    if (selectedCsIds.length > 0) {
      setSelectedCsIds([]);
      setCsFilterNotice('已根据运输类型更新可选集运单。');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMasterShipmentVendor(createForm.vendorName) || !createForm.vendorTrackingNo.trim()) {
      setCreateError('供应商和供应商单号为必填项');
      return;
    }
    if (selectedCsIds.length === 0) {
      setCreateError('请至少选择一个客户集运单');
      return;
    }
    const selectedShipments = unbatchedShipments.filter((shipment) => selectedCsIds.includes(shipment.id));
    if (selectedShipments.some((shipment) => shipment.shipmentType && shipment.shipmentType !== createForm.shipmentType)) {
      setCreateError('所选集运单运输类型与批次运输类型不一致。');
      return;
    }
    if (selectedShipments.length !== selectedCsIds.length || selectedShipments.some((shipment) => normalizePaymentStatus(shipment.paymentStatus) !== 'PAID')) {
      setCreateError('所选集运单必须全部为已支付且未加入批次的集运单。');
      return;
    }
    setCreating(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const result = await adminApi.createMasterShipment({
        shipmentType: createForm.shipmentType,
        vendorName: createForm.vendorName,
        vendorTrackingNo: createForm.vendorTrackingNo.trim(),
        customerShipmentIds: selectedCsIds,
      });
      setCreateSuccess(`创建成功！批次号：${result.batchNo}，包含 ${selectedCsIds.length} 个集运单`);
      resetCreateForm();
      setUnbatchedShipments([]);
      setShowCreate(false);
      await fetchData();
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
            setCsFilterNotice('');
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
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">新建国际批次</h2>
              <button
                type="button"
                onClick={() => {
                  if (!creating) setShowCreate(false);
                }}
                disabled={creating}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                aria-label="关闭"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-3 overflow-y-auto flex-1">
              {createSuccess && <div className="p-2 rounded bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}
              {createError && <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm break-all">{createError}</div>}
              <div>
                <label className="block text-xs font-medium mb-1">运输类型 *</label>
                <select
                  value={createForm.shipmentType}
                  onChange={(e) => handleShipmentTypeChange(e.target.value as ShipmentType)}
                  className="w-full px-3 py-2 rounded-md border text-sm"
                  required
                  disabled={creating}
                >
                  {SHIPMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">供应商 *</label>
                <select
                  value={createForm.vendorName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, vendorName: e.target.value as MasterShipmentVendor }))}
                  className="w-full px-3 py-2 rounded-md border text-sm"
                  required
                  disabled={creating}
                >
                  {MASTER_SHIPMENT_VENDOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  disabled={creating}
                />
              </div>

              {/* Customer Shipment Multi-Select */}
              <div>
                <label className="block text-xs font-medium mb-1">客户集运单 * ({selectedCsIds.length} 已选)</label>
                {csFilterNotice && <p className="mb-2 text-xs text-primary">{csFilterNotice}</p>}
                {selectedCsIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedCsIds.map((csId) => {
                      const cs = unbatchedShipments.find((s) => s.id === csId);
                      return (
                        <span key={csId} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                          {cs ? formatCustomerShipmentOption(cs) : safeShortId(csId)}
                          <button type="button" onClick={() => toggleCsSelection(csId)} disabled={creating} className="hover:text-red-600 disabled:opacity-50">
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
                    disabled={creating}
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
                    <p className="text-center py-3 text-xs text-muted-foreground">暂无已支付且未加入批次的集运单。</p>
                  ) : (
                    <ul className="divide-y">
                      {filteredUnbatched.map((cs) => {
                        const selected = selectedCsIds.includes(cs.id);
                        return (
                          <li key={cs.id}>
                            <button type="button" onClick={() => toggleCsSelection(cs.id)} disabled={creating} className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors disabled:opacity-50 ${selected ? 'bg-primary/5' : ''}`}>
                              <span className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${selected ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>{selected && <Check className="h-3 w-3" />}</span>
                              <span className="min-w-0 flex-1 break-words text-xs">
                                <span className="font-mono">{cs.shipmentNo || '未生成单号'}</span>{' '}
                                <span className="text-muted-foreground">{cs.customer?.customerCode || '未知客户'}</span>{' '}
                                <span className="text-muted-foreground">{formatShipmentType(cs.shipmentType)}</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)} disabled={creating} className="px-4 py-2 rounded-md border text-sm hover:bg-muted disabled:opacity-50">
                  取消
                </button>
                <button type="submit" disabled={creating} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                  {creating ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
          {creating && (
            <AdminBlockingOverlay
              title="正在创建批次，请稍候"
              description="正在关联集运单并保存批次信息..."
            />
          )}
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
                    <th className="text-left px-4 py-3 font-medium">运输类型</th>
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
                      <td className="px-4 py-3 text-xs">{formatShipmentType(s.shipmentType)}</td>
                      <td className="px-4 py-3">{s.vendorName || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.vendorTrackingNo || '-'}</td>
                      <td className="px-4 py-3">
                        <MasterShipmentStatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${s.publicPublished || s.publicVisible ? 'text-green-600' : 'text-muted-foreground'}`}>{s.publicPublished || s.publicVisible ? '已公开' : '未公开'}</span>
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
                    <p>运输类型：{formatShipmentType(s.shipmentType)}</p>
                    <p>供应商：{s.vendorName || '-'}</p>
                    <div className="flex justify-between">
                      <span className={s.publicPublished || s.publicVisible ? 'text-green-600' : ''}>{s.publicPublished || s.publicVisible ? '已公开' : '未公开'}</span>
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
