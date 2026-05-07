'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  LayoutDashboard,
  ClipboardList,
  Users,
  UserPlus,
  Truck,
  FileText,
  LogOut,
  User,
  ExternalLink,
} from 'lucide-react';
import { SITE_CONFIG, ADMIN_NAV_LINKS } from '@/lib/constants';
import { adminLogout, getAdminUser } from '@/lib/api/admin';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/types/admin';
import { AppVersionBadge } from '@/components/common/AppVersionBadge';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  UserPlus,
  Truck,
  FileText,
};

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setUser(getAdminUser());
  }, []);

  return (
    <aside className="w-64 h-full border-r bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">{SITE_CONFIG.brandDisplayName}</span>
            <span className="text-xs text-muted-foreground">管理后台</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {ADMIN_NAV_LINKS.map((link) => {
          const Icon = iconMap[link.icon];
          const isActive = pathname === link.href ||
            (link.href !== '/admin' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Info */}
      <div className="p-4 border-t">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName || user.phoneNumber}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="在新标签页打开官网首页"
          className="mb-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          <span>打开官网</span>
        </a>
        <button
          onClick={() => adminLogout()}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>退出登录</span>
        </button>
        <div className="mt-3 px-3">
          <AppVersionBadge />
        </div>
      </div>
    </aside>
  );
}
