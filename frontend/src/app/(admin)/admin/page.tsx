'use client';

import Link from 'next/link';
import {
  Package,
  Users,
  Truck,
  ClipboardList,
  FileText,
  ArrowRight,
} from 'lucide-react';

const quickLinks = [
  { href: '/admin/customers', label: '客户管理', icon: Users, color: 'bg-blue-100 text-blue-600' },
  { href: '/admin/inbound-packages', label: '入库包裹', icon: Package, color: 'bg-green-100 text-green-600' },
  { href: '/admin/customer-shipments', label: '客户集运单', icon: ClipboardList, color: 'bg-cyan-100 text-cyan-600' },
  { href: '/admin/transactions', label: '支付订单', icon: FileText, color: 'bg-amber-100 text-amber-600' },
  { href: '/admin/master-shipments', label: '国际批次', icon: Truck, color: 'bg-purple-100 text-purple-600' },
];

export default function AdminPage() {
  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">管理概览</h1>
        <p className="text-sm text-muted-foreground">欢迎使用广骏供应链管理后台</p>
      </header>

      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">快捷入口</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 p-5 rounded-lg border bg-card hover:border-primary/50 transition-colors group"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${link.color}`}>
                <link.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{link.label}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-lg border bg-card">
          <h3 className="font-semibold mb-2">系统说明</h3>
          <p className="text-sm text-muted-foreground">
            本系统提供客户管理、入库包裹管理、客户集运单管理、支付订单管理和国际批次管理功能。
            左侧导航栏可快速切换各功能模块。
          </p>
        </div>
      </div>
    </div>
  );
}
