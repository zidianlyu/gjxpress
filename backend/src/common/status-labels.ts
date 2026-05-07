import {
  InboundPackageStatus,
  CustomerShipmentStatus,
  MasterShipmentStatus,
  PaymentStatus,
} from '@prisma/client';

export const INBOUND_PACKAGE_STATUS_LABELS: Record<InboundPackageStatus, string> = {
  UNIDENTIFIED: '未识别',
  ARRIVED: '已入库',
  CONSOLIDATED: '已合箱',
};

export const CUSTOMER_SHIPMENT_STATUS_LABELS: Record<CustomerShipmentStatus, string> = {
  PACKED: '已打包',
  SHIPPED: '已发货',
  ARRIVED: '已到达',
  READY_FOR_PICKUP: '待自提',
  PICKED_UP: '已取货',
  EXCEPTION: '异常',
};

export const MASTER_SHIPMENT_STATUS_LABELS: Record<MasterShipmentStatus, string> = {
  IN_TRANSIT: '运输中',
  SIGNED: '已签收',
  READY_FOR_PICKUP: '待客人领取',
  EXCEPTION: '异常',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: '未支付',
  PROCESSING: '支付处理中',
  PENDING: '支付处理中',
  PAID: '已支付',
  WAIVED: '已免除',
  REFUNDED: '已退款',
};

export function getInboundPackageStage(status: InboundPackageStatus): string {
  switch (status) {
    case 'UNIDENTIFIED':
    case 'ARRIVED':
      return '国内仓';
    case 'CONSOLIDATED':
      return '待发运';
    default:
      return '国内仓';
  }
}

export function getCustomerShipmentStage(status: CustomerShipmentStatus): string {
  switch (status) {
    case 'PACKED':
      return '国内仓';
    case 'SHIPPED':
      return '国际运输';
    case 'ARRIVED':
    case 'READY_FOR_PICKUP':
      return '海外仓';
    case 'PICKED_UP':
      return '已完成';
    case 'EXCEPTION':
      return '异常';
    default:
      return '未知';
  }
}
