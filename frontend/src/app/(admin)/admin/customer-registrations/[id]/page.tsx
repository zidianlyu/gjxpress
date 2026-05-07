'use client';

import {useEffect, useState, useCallback} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft, Loader2, Save, CheckCircle, XCircle} from 'lucide-react';
import {adminApi} from '@/lib/api/admin';
import {ApiError} from '@/lib/api/client';
import type {CustomerRegistration} from '@/types/admin';
import {DeleteConfirmDialog} from '@/components/common/DeleteConfirmDialog';
import {CUSTOMER_REGISTRATION_STATUS_LABELS, CUSTOMER_REGISTRATION_STATUS_COLORS} from '@/lib/constants/status';
import {cn} from '@/lib/utils';

export default function CustomerRegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [reg, setReg] = useState<CustomerRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phoneCountryCode: '',
    phoneNumber: '',
    wechatId: '',
    domesticReturnAddress: '',
    notes: '',
    reviewNote: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [customerStatus, setCustomerStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [savingCustomerStatus, setSavingCustomerStatus] = useState(false);
  const [customerStatusError, setCustomerStatusError] = useState('');
  const [customerStatusSuccess, setCustomerStatusSuccess] = useState('');

  // Approve / Reject
  const [approveNote, setApproveNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [createdCustomerId, setCreatedCustomerId] = useState('');

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchReg = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getCustomerRegistrationById(id);
      setReg(data);
      setForm({
        phoneCountryCode: data.phoneCountryCode || '+86',
        phoneNumber: data.phoneNumber || '',
        wechatId: data.wechatId || '',
        domesticReturnAddress: data.domesticReturnAddress || '',
        notes: data.notes || '',
        reviewNote: data.reviewNote || '',
      });
      setCustomerStatus(data.createdCustomer?.status || 'ACTIVE');
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
  }, [id]);

  useEffect(() => {
    fetchReg();
  }, [fetchReg]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phoneNumber.trim()) {
      setSaveError('手机号不能为空');
      return;
    }
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const updated = await adminApi.updateCustomerRegistration(id, {
        phoneCountryCode: form.phoneCountryCode,
        phoneNumber: form.phoneNumber.trim(),
        wechatId: form.wechatId.trim() || null,
        domesticReturnAddress: form.domesticReturnAddress.trim() || null,
        notes: form.notes.trim() || null,
        reviewNote: form.reviewNote.trim() || null,
      });
      setReg(updated);
      setSaveSuccess('保存成功');
      setEditing(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setSaveError('保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    setCreatedCustomerId('');
    try {
      const result = await adminApi.approveCustomerRegistration(id, {
        reviewNote: approveNote.trim() || undefined,
      });
      setReg(result.registration);
      setCreatedCustomerId(result.customer.id);
      setCustomerStatus(result.customer.status || result.registration.createdCustomer?.status || 'ACTIVE');
      setActionSuccess(`已创建正式客户：${result.customer.customerCode}`);
      setApproveNote('');
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setActionError('审核失败');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const updated = await adminApi.rejectCustomerRegistration(id, {
        reviewNote: rejectNote.trim() || undefined,
      });
      setReg(updated);
      setActionSuccess('已拒绝申请');
      setRejectNote('');
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setActionError('操作失败');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCustomerStatusSave = async () => {
    if (!reg?.createdCustomer) return;
    setSavingCustomerStatus(true);
    setCustomerStatusError('');
    setCustomerStatusSuccess('');
    try {
      const updated = await adminApi.updateCustomer(reg.createdCustomer.id, {
        status: customerStatus,
      });
      setReg(prev => prev ? {
        ...prev,
        createdCustomer: prev.createdCustomer ? {
          ...prev.createdCustomer,
          status: updated.status,
          updatedAt: updated.updatedAt,
        } : prev.createdCustomer,
      } : prev);
      setCustomerStatus(updated.status);
      setCustomerStatusSuccess('客户状态已更新');
    } catch (err) {
      if (err instanceof ApiError) {
        setCustomerStatusError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setCustomerStatusError('客户状态更新失败');
      }
    } finally {
      setSavingCustomerStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    try {
      await adminApi.hardDeleteCustomerRegistration(id);
      router.push('/admin/customer-registrations');
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setDeleteError('删除失败');
      }
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          <p>{error}</p>
          {errorRequestId && <p className="mt-1 text-xs text-red-500 break-all">Request ID: {errorRequestId}</p>}
          <button onClick={fetchReg} className="mt-2 text-xs underline">重试</button>
        </div>
        <Link href="/admin/customer-registrations" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </Link>
      </div>
    );
  }

  if (!reg) return null;

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/customer-registrations" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">注册审核详情</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-muted-foreground font-mono">{reg.customerCode}</span>
              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', CUSTOMER_REGISTRATION_STATUS_COLORS[reg.status] || 'bg-gray-100 text-gray-700')}>
                {CUSTOMER_REGISTRATION_STATUS_LABELS[reg.status] || reg.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-2xl space-y-6">
        {/* Messages */}
        {saveSuccess && <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{saveSuccess}</div>}
        {saveError && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm break-all">{saveError}</div>}
        {actionSuccess && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
            <p>{actionSuccess}</p>
            {createdCustomerId && (
              <Link href={`/admin/customers/${createdCustomerId}`} className="inline-block mt-1 text-xs text-primary hover:underline">
                查看正式客户详情 →
              </Link>
            )}
          </div>
        )}
        {actionError && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm break-all">{actionError}</div>}
        {customerStatusSuccess && <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{customerStatusSuccess}</div>}
        {customerStatusError && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm break-all">{customerStatusError}</div>}

        {/* Info / Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">客户编号</label>
              <input type="text" value={reg.customerCode} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">状态</label>
              <div className="px-3 py-2">
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', CUSTOMER_REGISTRATION_STATUS_COLORS[reg.status] || 'bg-gray-100 text-gray-700')}>
                  {CUSTOMER_REGISTRATION_STATUS_LABELS[reg.status] || reg.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-24">
              <label className="block text-xs font-medium mb-1">区号</label>
              {editing ? (
                <select
                  value={form.phoneCountryCode}
                  onChange={(e) => setForm(f => ({...f, phoneCountryCode: e.target.value}))}
                  className="w-full px-2 py-2 rounded-md border bg-background text-sm"
                >
                  <option value="+86">+86</option>
                  <option value="+1">+1</option>
                </select>
              ) : (
                <input type="text" value={reg.phoneCountryCode} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">手机号</label>
              {editing ? (
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm(f => ({...f, phoneNumber: e.target.value}))}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                  required
                />
              ) : (
                <input type="text" value={reg.phoneNumber} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">微信号</label>
            {editing ? (
              <input
                type="text"
                value={form.wechatId}
                onChange={(e) => setForm(f => ({...f, wechatId: e.target.value}))}
                placeholder="可选"
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              />
            ) : (
              <input type="text" value={reg.wechatId || '-'} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">国内退货地址</label>
            {editing ? (
              <textarea
                value={form.domesticReturnAddress}
                onChange={(e) => setForm(f => ({...f, domesticReturnAddress: e.target.value}))}
                placeholder="可选"
                rows={2}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
              />
            ) : (
              <div className="px-3 py-2 rounded-md border bg-muted text-sm min-h-[40px]">{reg.domesticReturnAddress || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">备注</label>
            {editing ? (
              <textarea
                value={form.notes}
                onChange={(e) => setForm(f => ({...f, notes: e.target.value}))}
                placeholder="可选"
                rows={2}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
              />
            ) : (
              <div className="px-3 py-2 rounded-md border bg-muted text-sm min-h-[40px]">{reg.notes || '-'}</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">审核备注</label>
            {editing ? (
              <textarea
                value={form.reviewNote}
                onChange={(e) => setForm(f => ({...f, reviewNote: e.target.value}))}
                placeholder="管理员审核备注"
                rows={2}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
              />
            ) : (
              <div className="px-3 py-2 rounded-md border bg-muted text-sm min-h-[40px]">{reg.reviewNote || '-'}</div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>提交时间：{new Date(reg.createdAt).toLocaleString('zh-CN')}</p>
            {reg.approvedAt && <p>通过时间：{new Date(reg.approvedAt).toLocaleString('zh-CN')}</p>}
            {reg.rejectedAt && <p>拒绝时间：{new Date(reg.rejectedAt).toLocaleString('zh-CN')}</p>}
            {reg.createdCustomer && (
              <p>
                正式客户：
                <Link href={`/admin/customers/${reg.createdCustomer.id}`} className="text-primary hover:underline">
                  {reg.createdCustomer.customerCode}
                </Link>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {editing ? (
              <>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-md border text-sm hover:bg-muted">
                  取消
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50">
                  <Save className="h-4 w-4" />
                  {saving ? '保存中...' : '保存'}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => {setEditing(true); setSaveSuccess(''); setSaveError(''); setActionError(''); setActionSuccess('');}} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                编辑资料
              </button>
            )}
          </div>
        </form>

        {reg.createdCustomer && (
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">正式客户信息</h2>
                <p className="text-xs text-muted-foreground mt-1">客户状态独立于注册审核状态。</p>
              </div>
              <Link href={`/admin/customers/${reg.createdCustomer.id}`} className="text-sm text-primary hover:underline">
                查看客户详情
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">客户编号：</span><span className="font-mono">{reg.createdCustomer.customerCode}</span></div>
              <div><span className="text-muted-foreground">手机号：</span>{reg.createdCustomer.phoneCountryCode || ''} {reg.createdCustomer.phoneNumber || '-'}</div>
              <div><span className="text-muted-foreground">微信号：</span>{reg.createdCustomer.wechatId || '-'}</div>
              <div><span className="text-muted-foreground">当前客户状态：</span>{(reg.createdCustomer.status || customerStatus) === 'ACTIVE' ? '正常' : '停用'}</div>
              <div className="sm:col-span-2"><span className="text-muted-foreground">国内退货地址：</span>{reg.createdCustomer.domesticReturnAddress || '-'}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">客户状态</label>
                <select
                  value={customerStatus}
                  onChange={(e) => setCustomerStatus(e.target.value as 'ACTIVE' | 'DISABLED')}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                >
                  <option value="ACTIVE">正常</option>
                  <option value="DISABLED">停用</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleCustomerStatusSave}
                disabled={savingCustomerStatus || customerStatus === reg.createdCustomer.status}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {savingCustomerStatus ? '保存中...' : '保存客户状态'}
              </button>
            </div>
          </div>
        )}

        {/* Approve / Reject Section */}
        {reg.status === 'PENDING' && (
          <div className="rounded-lg border p-4 space-y-4">
            <h2 className="font-semibold">审核操作</h2>

            {/* Approve */}
            <div className="space-y-2">
              <label className="block text-xs font-medium">审核通过备注（可选）</label>
              <textarea
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="可选"
                rows={2}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
              />
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {actionLoading ? '处理中...' : '审核通过并创建客户'}
              </button>
            </div>

            <div className="border-t" />

            {/* Reject */}
            <div className="space-y-2">
              <label className="block text-xs font-medium">拒绝备注（可选）</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="可选"
                rows={2}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
              />
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {actionLoading ? '处理中...' : '拒绝申请'}
              </button>
            </div>
          </div>
        )}

        {/* Show link to created customer if approved */}
        {reg.status === 'APPROVED' && reg.createdCustomer && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
            <h2 className="font-semibold text-green-800">已审核通过</h2>
            <p className="text-sm text-green-700">
              正式客户编号：{reg.createdCustomer.customerCode}
            </p>
            <Link
              href={`/admin/customers/${reg.createdCustomer.id}`}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              查看客户详情 →
            </Link>
          </div>
        )}

        {reg.status === 'REJECTED' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h2 className="font-semibold text-red-800">已拒绝</h2>
            {reg.reviewNote && <p className="text-sm text-red-700 mt-1">审核备注：{reg.reviewNote}</p>}
          </div>
        )}

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-200 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">永久删除此注册申请记录。删除申请记录不会删除已经创建的正式客户。</p>
          <button onClick={() => setShowDelete(true)} disabled={saving || actionLoading} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
            永久删除申请
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => {setShowDelete(false); setDeleteError('');}}
        onConfirm={handleDelete}
        title="永久删除注册申请"
        description="删除后此申请记录将不可恢复。已创建的正式客户不会受影响。"
        confirmText="DELETE"
        entityLabel={reg.customerCode}
        error={deleteError}
      />
    </div>
  );
}
