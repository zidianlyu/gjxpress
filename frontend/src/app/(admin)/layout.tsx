'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { adminAuth } from '@/lib/api/admin';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { LoadingState } from '@/components/common/LoadingState';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(pathname !== '/admin/login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login page doesn't need auth check
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    // Check authentication
    const checkAuth = () => {
      const authenticated = adminAuth.isAuthenticated();
      if (!authenticated) {
        router.push('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router, isLoginPage]);

  // Login page layout (no sidebar)
  if (isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        {children}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState fullPage message="验证登录状态..." />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Admin layout with sidebar
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
