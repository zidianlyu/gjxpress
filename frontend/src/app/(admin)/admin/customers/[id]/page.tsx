'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { Customer } from '@/types/admin';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');

  // Edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phoneCountryCode: '', phoneNumber: '', wechatId: '', notes: '', status: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorRequestId('');
    try {
      const data = await adminApi.getCustomerById(id);
      setCustomer(data);
      setForm({
        phoneCountryCode: data.phoneCountryCode || '+86',
        phoneNumber: data.phoneNumber || '',
        wechatId: data.wechatId || '',
        notes: data.notes || '',
        status: data.status || 'ACTIVE',
      });
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
    fetchCustomer();
  }, [fetchCustomer]);

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
      const updated = await adminApi.updateCustomer(id, {
        phoneCountryCode: form.phoneCountryCode,
        phoneNumber: form.phoneNumber.trim(),
        wechatId: form.wechatId.trim() || undefined,
        notes: form.notes.trim() || undefined,
        status: form.status as 'ACTIVE' | 'DISABLED',
      });
      setCustomer(updated);
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

  const handleDisable = async () => {
    if (!confirm('确定禁用该客户？')) return;
    setSaving(true);
    setSaveError('');
    try {
      const updated = await adminApi.disableCustomer(id);
      setCustomer(updated);
      setForm(f => ({ ...f, status: 'DISABLED' }));
      setSaveSuccess('客户已禁用');
    } catch (err) {
      if (err instanceof ApiError) {
        setSaveError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
      } else {
        setSaveError('操作失败');
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBlockers, setDeleteBlockers] = useState<Record<string, number> | undefined>(undefined);

  const handleDelete = async () => {
    setDeleteError('');
    setDeleteBlockers(undefined);
    try {
      await adminApi.hardDeleteCustomer(id);
      router.push('/admin/customers');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409 && err.details) {
          setDeleteBlockers(err.details as Record<string, number>);
        } else {
          setDeleteError(`${err.message}${err.requestId ? ` (Request ID: ${err.requestId})` : ''}`);
        }
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
          {errorRequestId && <p className="mt-1 text-xs text-red-500">Request ID: {errorRequestId}</p>}
          <button onClick={fetchCustomer} className="mt-2 text-xs underline">重试</button>
        </div>
        <Link href="/admin/customers" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> 返回列表
        </Link>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">客户详情</h1>
            <p className="text-sm text-muted-foreground font-mono">{customer.customerCode}</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-2xl">
        {saveSuccess && (
          <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">{saveSuccess}</div>
        )}
        {saveError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{saveError}</div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">客户编号</label>
              <input type="text" value={customer.customerCode} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">状态</label>
              {editing ? (
                <select
                  value={form.status}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                >
                  <option value="ACTIVE">活跃</option>
                  <option value="DISABLED">禁用</option>
                </select>
              ) : (
                <div className="px-3 py-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${customer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {customer.status === 'ACTIVE' ? '活跃' : '禁用'}
                  </span>
                </div>
              )}
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
                <input type="text" value={customer.phoneCountryCode} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
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
                <input type="text" value={customer.phoneNumber} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
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
              <input type="text" value={customer.wechatId || '-'} disabled className="w-full px-3 py-2 rounded-md border bg-muted text-sm" />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">备注</label>
            {editing ? (
              <textarea
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="可选"
                rows={3}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
              />
            ) : (
              <div className="px-3 py-2 rounded-md border bg-muted text-sm min-h-[60px]">{customer.notes || '-'}</div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>创建时间：{new Date(customer.createdAt).toLocaleString('zh-CN')}</p>
            {customer.updatedAt && <p>更新时间：{new Date(customer.updatedAt).toLocaleString('zh-CN')}</p>}
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
              <>
                <button type="button" onClick={() => { setEditing(true); setSaveSuccess(''); setSaveError(''); }} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">
                  编辑
                </button>
                {customer.status === 'ACTIVE' && (
                  <button type="button" onClick={handleDisable} disabled={saving} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
                    禁用客户
                  </button>
                )}
              </>
            )}
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-6 rounded-lg border border-red-200 p-4 space-y-3">
          <h2 className="font-semibold text-red-700">危险操作</h2>
          <p className="text-xs text-muted-foreground">永久删除此客户。如存在关联入库包裹、集运单或交易记录，系统将阻止删除。</p>
          <button onClick={() => setShowDelete(true)} disabled={saving} className="px-4 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50">
            永久删除客户
          </button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeleteError(''); setDeleteBlockers(undefined); }}
        onConfirm={handleDelete}
        title="永久删除客户"
        description="删除后此客户数据将不可恢复。如果存在关联数据，系统会阻止删除。"
        confirmText="DELETE"
        entityLabel={customer.customerCode}
        blockers={deleteBlockers}
        error={deleteError}
      />
    </div>
  );
}
