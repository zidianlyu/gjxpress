'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Copy, Check, ArrowLeft } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';

export default function RegisterPage() {
  const [form, setForm] = useState({
    phoneCountryCode: '+86',
    phoneNumber: '',
    wechatId: '',
    domesticReturnAddress: '',
    notes: '',
  });
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errorRequestId, setErrorRequestId] = useState('');
  const [success, setSuccess] = useState<{ customerCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyChecked) {
      setError('请先确认隐私政策');
      return;
    }
    if (!form.phoneNumber.trim()) {
      setError('手机号不能为空');
      return;
    }
    setSubmitting(true);
    setError('');
    setErrorRequestId('');
    try {
      const response = await publicApi.createCustomerRegistration({
        phoneCountryCode: form.phoneCountryCode.trim() || '+86',
        phoneNumber: form.phoneNumber.trim(),
        wechatId: form.wechatId.trim() || undefined,
        domesticReturnAddress: form.domesticReturnAddress.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setSuccess({ customerCode: response.data.customerCode });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrorRequestId(err.requestId || '');
      } else {
        setError('提交失败，请稍后再试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.customerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = success.customerCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-2">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">注册信息已提交</h2>
          </div>

          <div className="rounded-lg bg-muted/50 p-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">您的客户编号</p>
            <p className="text-3xl font-bold tracking-wider text-primary">{success.customerCode}</p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm hover:bg-muted transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? '已复制' : '复制编号'}
            </button>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 space-y-1">
            <p className="font-medium">当前状态：待审核</p>
            <p>请保存该编号。工作人员审核通过后，该编号将用于包裹归属。</p>
            <p>客户编号不是登录密码，仅用于识别您的包裹。</p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            如信息有误，请联系工作人员。
          </p>

          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">新客户注册</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            请填写基础联系信息。提交后系统会生成客户编号，工作人员审核通过后，该编号可用于后续包裹归属。
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            <p>{error}</p>
            {errorRequestId && (
              <p className="text-xs mt-1 text-red-500 break-all">Request ID: {errorRequestId}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone */}
          <div className="grid grid-cols-[80px_1fr] gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">区号</label>
              <input
                type="text"
                value={form.phoneCountryCode}
                onChange={(e) => setForm(f => ({ ...f, phoneCountryCode: e.target.value }))}
                placeholder="+86"
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">手机号 *</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                placeholder="请输入手机号"
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                required
              />
            </div>
          </div>

          {/* WeChat */}
          <div>
            <label className="block text-xs font-medium mb-1">微信号</label>
            <input
              type="text"
              value={form.wechatId}
              onChange={(e) => setForm(f => ({ ...f, wechatId: e.target.value }))}
              placeholder="可选"
              className="w-full px-3 py-2 rounded-md border bg-background text-sm"
            />
          </div>

          {/* Domestic Return Address */}
          <div>
            <label className="block text-xs font-medium mb-1">国内退货地址</label>
            <textarea
              value={form.domesticReturnAddress}
              onChange={(e) => setForm(f => ({ ...f, domesticReturnAddress: e.target.value }))}
              placeholder="可选"
              rows={2}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">用于特殊情况下协助处理退回需求，可不填。</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium mb-1">备注</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="可选"
              rows={2}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">可填写其他需要工作人员注意的信息。</p>
          </div>

          {/* Privacy Checkbox */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="privacy-consent"
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="privacy-consent" className="text-sm text-muted-foreground leading-tight">
              我确认提交的信息用于客户联系、包裹归属和服务沟通，并已阅读
              <Link href="/privacy" className="text-primary hover:underline" target="_blank">隐私政策</Link>。
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !privacyChecked}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? '提交中...' : '提交注册信息'}
          </button>
        </form>
      </div>
    </div>
  );
}
