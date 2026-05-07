import Link from 'next/link';
import { Package } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';
import { siteConfig } from '@/lib/site-config';
import { AppVersionBadge } from '@/components/common/AppVersionBadge';

const footerLinks = {
  services: [
    { label: '服务介绍', href: '/services' },
    { label: '查询订单', href: '/tracking' },
    { label: '新客户注册', href: '/register' },
    { label: '联系我们', href: '/contact' },
    { label: '常见问题', href: '/faq' },
  ],
  legal: [
    { label: '合规说明', href: '/compliance' },
    { label: '隐私政策', href: '/privacy' },
    { label: '服务条款', href: '/terms' },
    { label: '赔付说明', href: '/compensation' },
    { label: '免责声明', href: '/disclaimer' },
  ],
  management: [{ label: '管理员入口', href: '/admin/login' }],
};

export function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const contacts = [siteConfig.publicContacts.domestic, siteConfig.publicContacts.us];

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2" aria-label="返回首页">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">{SITE_CONFIG.brandDisplayName}</span>
                <span className="text-xs leading-tight text-muted-foreground">{SITE_CONFIG.slogan}</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              广骏国际快运提供中国到美国方向跨境物流信息与转运协助服务。
            </p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">服务区域：</p>
              <p className="text-xs text-muted-foreground">{siteConfig.serviceAreas.join('、')}</p>
              <p className="text-xs text-muted-foreground">{siteConfig.handoffSummary}</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold">联系方式</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {contacts.map((contact) => (
                <div key={contact.label} className="rounded-lg border bg-background/60 p-4">
                  <p className="text-sm font-medium">{contact.label}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-muted-foreground">联系人：</dt>
                      <dd className="min-w-0 break-words">{contact.name}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-muted-foreground">电话：</dt>
                      <dd className="min-w-0">
                        <a href={contact.phoneHref} className="break-words text-primary hover:underline">
                          {contact.phone}
                        </a>
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-muted-foreground">微信：</dt>
                      <dd className="min-w-0 break-all">{contact.wechat}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{siteConfig.publicContacts.note}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">服务</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="mb-4 text-sm font-semibold">说明</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="mb-4 text-sm font-semibold">管理</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.management.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} {SITE_CONFIG.name}
          </p>
          <AppVersionBadge />
        </div>
      </div>
    </footer>
  );
}
