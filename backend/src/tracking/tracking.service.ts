import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CUSTOMER_SHIPMENT_STATUS_LABELS,
  MASTER_SHIPMENT_STATUS_LABELS,
} from '../common/status-labels';

const MAX_BATCH_UPDATE_LIMIT = 50;
const DEFAULT_BATCH_UPDATE_LIMIT = 10;

const masterShipmentPublicSelect = {
  vendorName: true,
  vendorTrackingNo: true,
  shipmentType: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { customerShipments: true } },
} satisfies Prisma.MasterShipmentSelect;

const customerShipmentTrackingSelect = {
  shipmentNo: true,
  shipmentType: true,
  status: true,
  publicTrackingEnabled: true,
  internationalTrackingNo: true,
  sentToOverseasAt: true,
  arrivedOverseasAt: true,
  localDeliveryRequestedAt: true,
  pickedUpAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  masterShipment: {
    select: {
      vendorName: true,
      vendorTrackingNo: true,
      shipmentType: true,
      status: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.CustomerShipmentSelect;

type PublicCustomerShipment = Prisma.CustomerShipmentGetPayload<{
  select: typeof customerShipmentTrackingSelect;
}>;

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(private prisma: PrismaService) {}

  async listBatchUpdates(limitQuery?: number) {
    const limitNumber = Number(limitQuery);
    const take = Math.min(
      Number.isFinite(limitNumber) && limitNumber > 0 ? Math.floor(limitNumber) : DEFAULT_BATCH_UPDATE_LIMIT,
      MAX_BATCH_UPDATE_LIMIT,
    );

    const [items, total] = await Promise.all([
      this.prisma.masterShipment.findMany({
        where: { publicPublished: true },
        take,
        select: masterShipmentPublicSelect,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.masterShipment.count({ where: { publicPublished: true } }),
    ]);

    this.logger.log(`Public batch updates listed count=${items.length} total=${total}`);

    return {
      items: items.map((item) => ({
        vendorName: item.vendorName,
        vendorTrackingNo: item.vendorTrackingNo,
        shipmentType: item.shipmentType,
        status: item.status,
        statusLabel: MASTER_SHIPMENT_STATUS_LABELS[item.status] ?? item.status,
        customerShipmentCount: item._count.customerShipments,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total,
    };
  }

  async search(rawQuery?: string) {
    const q = rawQuery?.trim().toUpperCase();
    if (!q) {
      throw new BadRequestException('q is required');
    }

    const shipment = await this.findShipmentByPublicQuery(q);
    if (!shipment || !shipment.publicTrackingEnabled) {
      this.logger.log(`Public tracking no_record queryPrefix=${q.slice(0, 3)}`);
      return {
        found: false,
        message: 'NO_RECORD',
        q,
      };
    }

    this.logger.log(`Public tracking found shipmentPrefix=${shipment.shipmentNo.slice(0, 3)}`);
    return this.formatCustomerShipment(shipment);
  }

  private async findShipmentByPublicQuery(q: string): Promise<PublicCustomerShipment | null> {
    if (q.startsWith('GJS')) {
      const byShipmentNo = await this.findByShipmentNo(q);
      if (byShipmentNo) return byShipmentNo;
    }

    const byShipmentNo = await this.findByShipmentNo(q);
    if (byShipmentNo) return byShipmentNo;

    if (/^GJ\d{4}$/.test(q)) {
      const byCustomerCode = await this.prisma.customerShipment.findFirst({
        where: {
          publicTrackingEnabled: true,
          customer: { customerCode: q },
        },
        select: customerShipmentTrackingSelect,
        orderBy: { createdAt: 'desc' },
      });
      if (byCustomerCode) return byCustomerCode;
    }

    const byInternationalTrackingNo = await this.prisma.customerShipment.findFirst({
      where: {
        publicTrackingEnabled: true,
        internationalTrackingNo: { equals: q, mode: 'insensitive' },
      },
      select: customerShipmentTrackingSelect,
      orderBy: { createdAt: 'desc' },
    });
    if (byInternationalTrackingNo) return byInternationalTrackingNo;

    const byDomesticTrackingNo = await this.prisma.customerShipment.findFirst({
      where: {
        publicTrackingEnabled: true,
        items: {
          some: {
            inboundPackage: {
              domesticTrackingNo: { equals: q, mode: 'insensitive' },
            },
          },
        },
      },
      select: customerShipmentTrackingSelect,
      orderBy: { createdAt: 'desc' },
    });
    if (byDomesticTrackingNo) return byDomesticTrackingNo;

    return this.prisma.customerShipment.findFirst({
      where: {
        publicTrackingEnabled: true,
        masterShipment: {
          vendorTrackingNo: { equals: q, mode: 'insensitive' },
        },
      },
      select: customerShipmentTrackingSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  private findByShipmentNo(shipmentNo: string) {
    return this.prisma.customerShipment.findUnique({
      where: { shipmentNo },
      select: customerShipmentTrackingSelect,
    });
  }

  private formatCustomerShipment(shipment: PublicCustomerShipment) {
    return {
      found: true,
      type: 'CUSTOMER_SHIPMENT',
      shipmentNo: shipment.shipmentNo,
      shipmentType: shipment.shipmentType,
      status: shipment.status,
      statusLabel: CUSTOMER_SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status,
      updatedAt: shipment.updatedAt,
      createdAt: shipment.createdAt,
      masterShipment: shipment.masterShipment
        ? {
            vendorName: shipment.masterShipment.vendorName,
            vendorTrackingNo: shipment.masterShipment.vendorTrackingNo,
            shipmentType: shipment.masterShipment.shipmentType,
            status: shipment.masterShipment.status,
            statusLabel: MASTER_SHIPMENT_STATUS_LABELS[shipment.masterShipment.status] ?? shipment.masterShipment.status,
            updatedAt: shipment.masterShipment.updatedAt,
          }
        : null,
      timeline: this.buildTimeline(shipment),
    };
  }

  private buildTimeline(shipment: PublicCustomerShipment) {
    return [
      { label: '集运单创建', status: 'PACKED', time: shipment.createdAt },
      { label: '已发往海外', status: 'SHIPPED', time: shipment.sentToOverseasAt },
      { label: '已到达海外仓', status: 'ARRIVED', time: shipment.arrivedOverseasAt },
      { label: '待自提', status: 'READY_FOR_PICKUP', time: shipment.localDeliveryRequestedAt },
      { label: '已取货', status: 'PICKED_UP', time: shipment.pickedUpAt },
      { label: '已完成', status: 'COMPLETED', time: shipment.completedAt },
    ].filter((event) => event.time);
  }
}
