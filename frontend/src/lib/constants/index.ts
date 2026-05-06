export * from './status';

// Site configuration
export const SITE_CONFIG = {
  name: '广骏供应链服务',
  brandDisplayName: '广骏国际快运',
  slogan: '看得见的跨境物流',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gjxpress.net',
  defaultLocale: 'zh-CN',
};

// Navigation links for public site
export const PUBLIC_NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/services', label: '服务' },
  { href: '/tracking', label: '查询' },
  { href: '/batch-updates', label: '批次更新' },
  { href: '/register', label: '新客户注册' },
  { href: '/compliance', label: '合规' },
  { href: '/privacy', label: '隐私' },
  { href: '/admin/login', label: 'Admin' },
];

// Admin navigation links
export const ADMIN_NAV_LINKS = [
  { href: '/admin', label: '仪表盘', icon: 'LayoutDashboard' },
  { href: '/admin/customer-registrations', label: '新客户审核', icon: 'UserPlus' },
  { href: '/admin/customers', label: '客户', icon: 'Users' },
  { href: '/admin/inbound-packages', label: '入库包裹', icon: 'Package' },
  { href: '/admin/customer-shipments', label: '客户集运单', icon: 'ClipboardList' },
  { href: '/admin/master-shipments', label: '国际批次', icon: 'Truck' },
  { href: '/admin/transactions', label: '交易记录', icon: 'FileText' },
];
