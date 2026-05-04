'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  AlertTriangle,
  FileText,
  LogOut,
  Package as PackageIcon,
} from 'lucide-react';
import { ADMIN_NAV_LINKS, SITE_CONFIG } from '@/lib/constants';
import { adminAuth } from '@/lib/api/admin';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ClipboardList,
  Package,
  AlertTriangle,
  FileText,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const user = adminAuth.getUser();

  const handleLogout = () => {
    adminAuth.logout();
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <PackageIcon className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">{SITE_CONFIG.brandDisplayName}</span>
            <span className="text-xs text-slate-400 leading-tight">管理后台</span>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-sm text-slate-300">欢迎，</p>
        <p className="font-medium">{user?.displayName || user?.username || '管理员'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {ADMIN_NAV_LINKS.map((link) => {
          const Icon = iconMap[link.icon];
          const isActive = pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
