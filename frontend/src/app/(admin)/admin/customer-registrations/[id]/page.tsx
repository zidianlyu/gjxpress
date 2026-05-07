'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { CustomerRegistration } from '@/types/admin';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { AdminBlockingOverlay } from '@/components/admin/AdminBlockingOverlay';

function buildForm(reg: CustomerRegistration) {
  return {
    phoneCountryCode: reg.phoneCountryCode || '+86',
    phoneNumber: reg.phoneNumber || '',
    wechatId: reg.wechatId || '',
    domesticReturnAddress: reg.domesticReturnAddress || '',
  };
}

export default function CustomerRegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [reg, setReg] = useState<CustomerRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phoneCountryCode: '+86',
    phoneNumber: '',
    wechatId: '',
    domesticReturnAddress: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReg = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getCustomerRegistrationById(id);
      setReg(data);
      setForm(buildForm(data));
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
    setApproveError('');
    try {
      const updated = await adminApi.updateCustomerRegistration(id, {
        phoneCountryCode: form.phoneCountryCode,
        phoneNumber: form.phoneNumber.trim(),
        wechatId: form.wechatId.trim() || null,
        domesticReturnAddress: form.domesticReturnAddress.trim() || null,
      });
      setReg(updated);
      setForm(buildForm(updated));
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
    setApproving(true);
    setApproveError('');
    setSaveSuccess('');
    try {
      await adminApi.approveCustomerRegistration(id);
      window.sessionStorage.setItem('gjx_admin_notice', '已通过审核并创建客户。');
      router.push('/admin/customers');
    } catch (err) {
      if (err instanceof ApiError) {
        setApproveError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setApproveError('审核失败');
      }
    } finally {
      setApproving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      await adminApi.hardDeleteCustomerRegistration(id);
      setShowDelete(false);
      window.sessionStorage.setItem('gjx_admin_notice', '注册申请已删除。');
      router.push('/admin/customer-registrations');
    } catch (err) {
      if (err instanceof ApiError) {
        setDeleteError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setDeleteError('删除失败');
      }
      setIsDeleting(false);
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
            <p className="text-sm text-muted-foreground font-mono mt-0.5">{reg.customerCode}</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-2xl space-y-6">
        {saveSuccess && <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{saveSuccess}</div>}
        {saveError && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm break-all">{saveError}</div>}
        {approveError && <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm break-all">{approveError}</div>}

        <form onSubmit={handleSave} className="space-y-4 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">编辑 / 完善客户信息</h2>
              <p className="text-xs text-muted-foreground mt-1">通过审核前可更新手机号、微信号和国内退货地址。</p>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={() => { setEditing(true); setSaveSuccess(''); setSaveError(''); setApproveError(''); }}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
              >
                编辑资料
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">客户编号</label>
              <input type="text" value={reg.customerCode} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-24">
              <label className="block text-xs font-medium mb-1">区号</label>
              {editing ? (
                <select
                  value={form.phoneCountryCode}
                  onChange={(e) => setForm(f => ({ ...f, phoneCountryCode: e.target.value }))}
                  className="w-full px-2 py-2 rounded-md border bg-background text-sm"
                >
                  <option value="+86">+86</option>
                  <option value="+1">+1</option>
                </select>
              ) : (
                <input type="text" value={reg.phoneCountryCode || '-'} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">手机号</label>
              {editing ? (
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                  required
                />
              ) : (
                <input type="text" value={reg.phoneNumber || '-'} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">微信号</label>
            {editing ? (
              <input
                type="text"
                value={form.wechatId}
                onChange={(e) => setForm(f => ({ ...f, wechatId: e.target.value }))}
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
                onChange={(e) => setForm(f => ({ ...f, domesticReturnAddress: e.target.value }))}
                placeholder="可选"
                rows={2}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
              />
            ) : (
              <div className="px-3 py-2 rounded-md border bg-muted text-sm min-h-[40px]">{reg.domesticReturnAddress || '-'}</div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>提交时间：{new Date(reg.createdAt).toLocaleString('zh-CN')}</p>
            {reg.updatedAt && <p>更新时间：{new Date(reg.updatedAt).toLocaleString('zh-CN')}</p>}
          </div>

          {editing && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => { setEditing(false); setForm(buildForm(reg)); }}
                className="px-4 py-2 rounded-md border text-sm hover:bg-muted"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          )}
        </form>

        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">审核操作</h2>
          <p className="text-xs text-muted-foreground">
            通过审核后会创建正式客户，并由后端永久删除当前注册申请记录。
          </p>
          <button
            type="button"
            onClick={handleApprove}
            disabled={approving || saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {approving ? '处理中...' : '通过审核'}
          </button>
        </div>

        <div className="rounded-lg border border-red-200 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">此操作只删除注册申请，不删除正式 Customer。</p>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            disabled={saving || approving || isDeleting}
            className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
          >
            删除申请
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => {
          if (isDeleting) return;
          setShowDelete(false);
          setDeleteError('');
        }}
        onConfirm={handleDelete}
        title="删除申请"
        description="此操作会永久删除该注册申请，无法恢复。"
        confirmButtonText="删除"
        cancelButtonText="取消"
        requireTypedConfirmation={false}
        entityLabel={reg.customerCode}
        error={deleteError}
      />
      {isDeleting && <AdminBlockingOverlay title="正在删除，请稍候" description="正在删除注册申请..." />}
    </div>
  );
}
