'use client';

import {
  INBOUND_PACKAGE_STATUS_LABELS,
  INBOUND_PACKAGE_STATUS_COLORS,
  CUSTOMER_SHIPMENT_STATUS_LABELS,
  CUSTOMER_SHIPMENT_STATUS_COLORS,
  MASTER_SHIPMENT_STATUS_LABELS,
  MASTER_SHIPMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  CUSTOMER_REGISTRATION_STATUS_LABELS,
  CUSTOMER_REGISTRATION_STATUS_COLORS,
} from '@/lib/constants';
import { formatPaymentStatus, normalizePaymentStatus } from '@/lib/customer-shipment-status';
import { formatMasterShipmentStatus, normalizeMasterShipmentStatus } from '@/lib/master-shipment-status';
import { cn } from '@/lib/utils';

type BadgeType = 'inboundPackage' | 'customerShipment' | 'masterShipment' | 'payment' | 'customerRegistration';

interface StatusBadgeProps {
  status: string;
  type: BadgeType;
  className?: string;
}

const typeConfig: Record<BadgeType, { labels: Record<string, string>; colors: Record<string, string> }> = {
  inboundPackage: {
    labels: INBOUND_PACKAGE_STATUS_LABELS,
    colors: INBOUND_PACKAGE_STATUS_COLORS,
  },
  customerShipment: {
    labels: CUSTOMER_SHIPMENT_STATUS_LABELS,
    colors: CUSTOMER_SHIPMENT_STATUS_COLORS,
  },
  masterShipment: {
    labels: MASTER_SHIPMENT_STATUS_LABELS,
    colors: MASTER_SHIPMENT_STATUS_COLORS,
  },
  payment: {
    labels: PAYMENT_STATUS_LABELS,
    colors: PAYMENT_STATUS_COLORS,
  },
  customerRegistration: {
    labels: CUSTOMER_REGISTRATION_STATUS_LABELS,
    colors: CUSTOMER_REGISTRATION_STATUS_COLORS,
  },
};

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const config = typeConfig[type];
  const normalizedStatus = type === 'payment' ? normalizePaymentStatus(status) : type === 'masterShipment' ? normalizeMasterShipmentStatus(status) : status;
  const label = type === 'payment' ? formatPaymentStatus(status) : type === 'masterShipment' ? formatMasterShipmentStatus(status) : config.labels[status] || status;
  const colorClass = config.colors[normalizedStatus] || 'bg-gray-100 text-gray-700';

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

export function InboundPackageStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="inboundPackage" className={className} />;
}

export function CustomerShipmentStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="customerShipment" className={className} />;
}

export function MasterShipmentStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="masterShipment" className={className} />;
}

export function PaymentStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="payment" className={className} />;
}

export function CustomerRegistrationStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadge status={status} type="customerRegistration" className={className} />;
}
