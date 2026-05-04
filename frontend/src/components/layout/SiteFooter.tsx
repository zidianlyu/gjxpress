import Link from 'next/link';
import { Package, Phone, Mail, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

const footerLinks = {
  services: [
    { label: '中美集运', href: '/services/china-us-shipping' },
    { label: '空运服务', href: '/services/air-freight' },
    { label: '海运服务', href: '/services/sea-freight' },
    { label: '服务流程', href: '/how-it-works' },
  ],
  company: [
    { label: '关于我们', href: '/about' },
    { label: '本地推荐', href: '/recommendations' },
    { label: '联系我们', href: '/contact' },
  ],
  support: [
    { label: '使用指南', href: '/how-it-works' },
    { label: '常见问题', href: '/contact' },
    { label: '隐私政策', href: '/privacy' },
  ],
};

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">{SITE_CONFIG.brandDisplayName}</span>
                <span className="text-xs text-muted-foreground leading-tight">{SITE_CONFIG.slogan}</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              提供中美跨境供应链与物流信息服务，支持入库拍照、包裹确认、发货管理与物流查询。
            </p>
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

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">公司</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">联系方式</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>微信客服</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@gjxpress.net</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>美国本地服务</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              仅供 demonstration，非真实商业服务
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
