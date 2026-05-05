'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Loader2 } from 'lucide-react';
import { adminLogin } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import { SITE_CONFIG } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phoneCountryCode, setPhoneCountryCode] = useState('+86');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await adminLogin({ phoneCountryCode, phoneNumber, password });
      router.push('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('登录失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-lg border bg-card shadow-lg">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
          <Package className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">{SITE_CONFIG.brandDisplayName}</h1>
        <p className="text-sm text-muted-foreground mt-1">管理后台登录</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
            手机号
          </label>
          <div className="flex gap-2">
            <select
              value={phoneCountryCode}
              onChange={(e) => setPhoneCountryCode(e.target.value)}
              className="w-20 px-2 py-2 rounded-md border bg-background text-sm"
            >
              <option value="+86">+86</option>
              <option value="+1">+1</option>
            </select>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="flex-1 px-3 py-2 rounded-md border bg-background"
              placeholder="请输入手机号"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md border bg-background"
            placeholder="请输入密码"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              登录中...
            </>
          ) : (
            '登录'
          )}
        </button>
      </form>

      {/* Back to site */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          返回网站首页
        </Link>
      </div>
    </div>
  );
}
