import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CUSTOMER_SHIPMENT_STATUS_LABELS,
  MASTER_SHIPMENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  getCustomerShipmentStage,
} from '../common/status-labels';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async listRecommendations(page: any = 1, pageSize: any = 20, category?: string, city?: string) {
    const take = Math.min(Number(pageSize) || 20, 100);
    const skip = (Number(page) - 1) * take;

    const where: any = { status: 'PUBLISHED' };
    if (category) where.category = category;
    if (city) where.city = city;

    const [data, total] = await Promise.all([
      this.prisma.recommendation.findMany({
        where,
        skip,
        take,
        select: { id: true, slug: true, title: true, summary: true, category: true, city: true, tags: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.recommendation.count({ where }),
    ]);

    return {
      data,
      pagination: { page: Number(page), pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getRecommendation(slug: string) {
    const rec = await this.prisma.recommendation.findUnique({ where: { slug } });
    if (!rec || rec.status !== 'PUBLISHED') throw new NotFoundException('Recommendation not found');
    return { data: rec };
  }

  async trackShipment(shipmentNo: string) {
    const shipment = await this.prisma.customerShipment.findUnique({
      where: { shipmentNo },
      select: {
        id: true,
        shipmentNo: true,
        status: true,
        paymentStatus: true,
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
            batchNo: true,
            status: true,
            publicVisible: true,
            publicTitle: true,
            publicSummary: true,
            publicStatusText: true,
          },
        },
        _count: { select: { items: true } },
      },
    });

    if (!shipment || !shipment.publicTrackingEnabled) {
      return {
        found: false,
        message: 'NO_RECORD',
        shipmentNo,
      };
    }

    const batch = shipment.masterShipment?.publicVisible
      ? {
          batchNo: shipment.masterShipment.batchNo,
          statusLabel: MASTER_SHIPMENT_STATUS_LABELS[shipment.masterShipment.status] ?? shipment.masterShipment.status,
          publicTitle: shipment.masterShipment.publicTitle,
          publicSummary: shipment.masterShipment.publicSummary,
          publicStatusText: shipment.masterShipment.publicStatusText,
        }
      : null;

    return {
      found: true,
      shipmentNo: shipment.shipmentNo,
      status: shipment.status,
      statusLabel: CUSTOMER_SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status,
      stage: getCustomerShipmentStage(shipment.status),
      paymentStatusLabel: PAYMENT_STATUS_LABELS[shipment.paymentStatus] ?? shipment.paymentStatus,
      packageCount: shipment._count.items,
      timeline: {
        createdAt: shipment.createdAt,
        sentToOverseasAt: shipment.sentToOverseasAt,
        arrivedOverseasAt: shipment.arrivedOverseasAt,
        localDeliveryRequestedAt: shipment.localDeliveryRequestedAt,
        pickedUpAt: shipment.pickedUpAt,
        completedAt: shipment.completedAt,
      },
      batch,
      updatedAt: shipment.updatedAt,
    };
  }

  async getBatchUpdate(batchNo: string) {
    const master = await this.prisma.masterShipment.findUnique({
      where: { batchNo },
      select: {
        batchNo: true,
        status: true,
        publicVisible: true,
        publicTitle: true,
        publicSummary: true,
        publicStatusText: true,
        publishedAt: true,
        arrivedOverseasAt: true,
        updatedAt: true,
      },
    });

    if (!master || !master.publicVisible) {
      throw new NotFoundException('Batch not found or not publicly visible');
    }

    return {
      data: {
        batchNo: master.batchNo,
        statusLabel: MASTER_SHIPMENT_STATUS_LABELS[master.status] ?? master.status,
        publicTitle: master.publicTitle,
        publicSummary: master.publicSummary,
        publicStatusText: master.publicStatusText,
        publishedAt: master.publishedAt,
        arrivedOverseasAt: master.arrivedOverseasAt,
        updatedAt: master.updatedAt,
      },
    };
  }

  async listBatchUpdates(query: { page?: number; pageSize?: number }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 10, 50);
    const skip = (page - 1) * take;

    const [data, total] = await Promise.all([
      this.prisma.masterShipment.findMany({
        where: { publicVisible: true },
        skip,
        take,
        select: {
          batchNo: true,
          status: true,
          publicTitle: true,
          publicSummary: true,
          publicStatusText: true,
          publishedAt: true,
          arrivedOverseasAt: true,
          updatedAt: true,
        },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.masterShipment.count({ where: { publicVisible: true } }),
    ]);

    return {
      data: data.map((m) => ({
        batchNo: m.batchNo,
        statusLabel: MASTER_SHIPMENT_STATUS_LABELS[m.status] ?? m.status,
        publicTitle: m.publicTitle,
        publicSummary: m.publicSummary,
        publicStatusText: m.publicStatusText,
        publishedAt: m.publishedAt,
        arrivedOverseasAt: m.arrivedOverseasAt,
        updatedAt: m.updatedAt,
      })),
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }
}
