'use client';

import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  EXCEPTION_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  EXCEPTION_STATUS_COLORS,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type: 'order' | 'payment' | 'exception' | 'package';
  className?: string;
}

const typeConfig: Record<string, { labels: Record<string, string>; colors: Record<string, string>; defaultColor: string }> = {
  order: {
    labels: ORDER_STATUS_LABELS,
    colors: ORDER_STATUS_COLORS,
    defaultColor: 'bg-gray-100 text-gray-700',
  },
  payment: {
    labels: PAYMENT_STATUS_LABELS,
    colors: PAYMENT_STATUS_COLORS,
    defaultColor: 'bg-gray-100 text-gray-700',
  },
  exception: {
    labels: EXCEPTION_STATUS_LABELS,
    colors: EXCEPTION_STATUS_COLORS,
    defaultColor: 'bg-gray-100 text-gray-700',
  },
  package: {
    labels: {
      CREATED: '已创建',
      INBOUNDED: '已入库',
      USER_CONFIRM_PENDING: '待用户确认',
      CONFIRMED: '已确认',
      EXCEPTION: '异常',
      SHIPPED: '已发货',
    },
    colors: ORDER_STATUS_COLORS,
    defaultColor: 'bg-gray-100 text-gray-700',
  },
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config = typeConfig[type];
  const label = config.labels[status] || status;
  const colorClass = config.colors[status] || config.defaultColor;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}

// Specialized exports for convenience
export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="order" className={className} />;
}

export function PaymentStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="payment" className={className} />;
}

export function ExceptionStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="exception" className={className} />;
}

export function PackageStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="package" className={className} />;
}
