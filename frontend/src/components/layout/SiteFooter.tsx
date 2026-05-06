import Link from 'next/link';
import { Package } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { siteConfig } from '@/lib/site-config';

const footerLinks = {
  services: [
    { label: '服务介绍', href: '/services' },
    { label: '物流状态查询', href: '/tracking' },
    { label: '批次更新', href: '/batch-updates' },
    { label: '新客户注册', href: '/register' },
    { label: '常见问题', href: '/faq' },
  ],
  legal: [
    { label: '合规说明', href: '/compliance' },
    { label: '隐私政策', href: '/privacy' },
    { label: '服务条款', href: '/terms' },
    { label: '异常与赔付说明', href: '/compensation' },
    { label: '免责声明', href: '/disclaimer' },
  ],
  management: [
    { label: '管理员入口', href: '/admin/login' },
  ],
};

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2" aria-label="返回首页">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">{SITE_CONFIG.brandDisplayName}</span>
                <span className="text-xs text-muted-foreground leading-tight">{SITE_CONFIG.slogan}</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              提供跨境供应链与物流信息服务，支持仓储入库、包裹状态查询、集运单状态跟踪与本地递送安排。
            </p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">服务区域：</p>
              <p className="text-xs text-muted-foreground">
                {siteConfig.serviceAreas.join('、')}
              </p>
              <p className="text-xs text-muted-foreground">
                {siteConfig.handoffSummary}
              </p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">服务</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">说明</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Management */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">管理</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.management.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {currentYear} {SITE_CONFIG.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
