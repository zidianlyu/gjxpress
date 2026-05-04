export * from './status';

// Site configuration
export const SITE_CONFIG = {
  name: '广骏供应链服务',
  brandDisplayName: '广骏国际快运',
  slogan: '看得见的跨境物流',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gjxpress.net',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gjxpress.net',
  defaultLocale: 'zh-CN',
};

// Navigation links for public site
export const PUBLIC_NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/services', label: '服务' },
  { href: '/how-it-works', label: '使用流程' },
  { href: '/recommendations', label: '本地推荐' },
  { href: '/contact', label: '联系我们' },
];

// Admin navigation links
export const ADMIN_NAV_LINKS = [
  { href: '/admin/dashboard', label: '概览', icon: 'LayoutDashboard' },
  { href: '/admin/orders', label: '订单管理', icon: 'ClipboardList' },
  { href: '/admin/packages', label: '包裹管理', icon: 'Package' },
  { href: '/admin/exceptions', label: '异常处理', icon: 'AlertTriangle' },
  { href: '/admin/logs', label: '操作日志', icon: 'FileText' },
];
