'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Copy, Check, ArrowLeft, ArrowRight, UserPlus, ClipboardCheck, Search as SearchIcon } from 'lucide-react';
import { publicApi } from '@/lib/api/public';
import { ApiError } from '@/lib/api/client';
import FaqSection from '@/components/public/FaqSection';
import { RelatedLinks } from '@/components/public/RelatedLinks';
import { registerFaqs } from '@/lib/faq';

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mx-auto max-w-md">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
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
                {copied ? '已复制' : '复制客户编号'}
              </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-2">
              <p className="font-medium">当前状态：待审核</p>
              <p>请保存该编号。工作人员审核通过后，该编号将用于包裹归属。</p>
              <p>客户编号不是登录密码，也不代表已开通登录账户。</p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              如信息有误，请联系工作人员修改。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
              >
                查看服务介绍
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">新客户注册</h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            填写基本联系信息，提交后系统生成客户编号，工作人员审核通过后，该编号用于后续包裹归属。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Form Card */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            {error && (
              <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                <p>{error}</p>
                {errorRequestId && (
                  <p className="text-xs mt-1 text-red-500 break-all">Request ID: {errorRequestId}</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  手机号
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={form.phoneCountryCode}
                    onChange={(e) => setForm({ ...form, phoneCountryCode: e.target.value })}
                    className="w-full sm:w-20 px-3 py-2.5 rounded-md border bg-background text-sm"
                    placeholder="+86"
                  />
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-md border bg-background text-sm"
                    placeholder="请输入手机号"
                  />
                </div>
              </div>

              {/* WeChat */}
              <div>
                <label className="block text-xs font-medium mb-1.5">微信号</label>
                <input
                  type="text"
                  value={form.wechatId}
                  onChange={(e) => setForm(f => ({ ...f, wechatId: e.target.value }))}
                  placeholder="可选"
                  className="w-full px-3 py-2.5 rounded-md border bg-background text-sm"
                />
              </div>

              {/* Domestic Return Address */}
              <div>
                <label className="block text-xs font-medium mb-1.5">国内退货地址</label>
                <textarea
                  value={form.domesticReturnAddress}
                  onChange={(e) => setForm(f => ({ ...f, domesticReturnAddress: e.target.value }))}
                  placeholder="可选"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-md border bg-background text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">用于特殊情况下协助处理退回需求，可不填。</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1.5">备注</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="可选"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-md border bg-background text-sm resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">可填写其他需要工作人员注意的信息。</p>
              </div>

              {/* Privacy Checkbox */}
              <label htmlFor="privacy-consent" className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  checked={privacyChecked}
                  onChange={(e) => setPrivacyChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 shrink-0"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  我确认提交的信息用于客户联系、包裹归属和服务沟通，并已阅读
                  <Link href="/privacy" className="text-primary hover:underline" target="_blank" onClick={(e) => e.stopPropagation()}>隐私政策</Link>。
                </span>
              </label>

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

          {/* Info Sidebar */}
          <div className="space-y-4">
            {/* What happens after */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold mb-4">注册后会发生什么？</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">1</div>
                  <div>
                    <p className="text-sm font-medium">提交信息</p>
                    <p className="text-xs text-muted-foreground">系统生成客户编号</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">2</div>
                  <div>
                    <p className="text-sm font-medium">工作人员审核</p>
                    <p className="text-xs text-muted-foreground">核实联系信息</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">3</div>
                  <div>
                    <p className="text-sm font-medium">审核通过</p>
                    <p className="text-xs text-muted-foreground">客户编号可用于包裹归属</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info notes */}
            <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
              <div className="flex items-start gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">客户编号用于包裹归属识别</p>
              </div>
              <div className="flex items-start gap-2">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">信息仅用于服务沟通和包裹处理</p>
              </div>
              <div className="flex items-start gap-2">
                <SearchIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">审核通过后工作人员会联系确认</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 pt-16 border-t">
        <div className="mx-auto max-w-4xl">
          <FaqSection
            title="注册常见问题"
            description="关于新客户注册和客户编号的常见问题"
            faqs={registerFaqs}
          />
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-16 pt-16 border-t">
        <div className="mx-auto max-w-4xl">
          <RelatedLinks
            links={[
              { label: "隐私政策", href: "/privacy" },
              { label: "服务介绍", href: "/services" },
              { label: "合规说明", href: "/compliance" },
              { label: "常见问题", href: "/faq" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
