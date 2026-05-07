import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerRegistrationsService } from '../customer-registrations/customer-registrations.service';
import { CreateCustomerRegistrationDto } from '../customer-registrations/dto/create-customer-registration.dto';
import {
  CUSTOMER_SHIPMENT_STATUS_LABELS,
  MASTER_SHIPMENT_STATUS_LABELS,
  getCustomerShipmentStage,
} from '../common/status-labels';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private customerRegistrationsService: CustomerRegistrationsService,
  ) {}

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
    const normalizedShipmentNo = shipmentNo.trim().toUpperCase();
    const shipment = await this.prisma.customerShipment.findUnique({
      where: { shipmentNo: normalizedShipmentNo },
      select: {
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
            publicPublished: true,
            updatedAt: true,
          },
        },
        _count: { select: { items: true } },
      },
    });

    if (!shipment || !shipment.publicTrackingEnabled) {
      return {
        found: false,
        message: 'NO_RECORD',
        shipmentNo: normalizedShipmentNo,
      };
    }

    const batch = shipment.masterShipment && shipment.masterShipment.publicPublished
      ? {
          vendorName: shipment.masterShipment.vendorName,
          vendorTrackingNo: shipment.masterShipment.vendorTrackingNo,
          shipmentType: shipment.masterShipment.shipmentType,
          status: shipment.masterShipment.status,
          statusLabel: MASTER_SHIPMENT_STATUS_LABELS[shipment.masterShipment.status] ?? shipment.masterShipment.status,
          updatedAt: shipment.masterShipment.updatedAt,
        }
      : null;

    return {
      found: true,
      shipmentNo: shipment.shipmentNo,
      shipmentType: shipment.shipmentType,
      status: shipment.status,
      statusLabel: CUSTOMER_SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status,
      stage: getCustomerShipmentStage(shipment.status),
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
        shipmentType: true,
        status: true,
        publicPublished: true,
        publishedAt: true,
        arrivedOverseasAt: true,
        updatedAt: true,
      },
    });

    if (!master || !master.publicPublished) {
      throw new NotFoundException('Batch not found or not publicly visible');
    }

    return {
      data: {
        batchNo: master.batchNo,
        shipmentType: master.shipmentType,
        status: master.status,
        statusLabel: MASTER_SHIPMENT_STATUS_LABELS[master.status] ?? master.status,
        publishedAt: master.publishedAt,
        arrivedOverseasAt: master.arrivedOverseasAt,
        updatedAt: master.updatedAt,
      },
    };
  }

  async submitRegistration(
    dto: CreateCustomerRegistrationDto,
    meta?: { userAgent?: string },
  ) {
    return this.customerRegistrationsService.createRegistration(dto, { userAgent: meta?.userAgent });
  }

  async listBatchUpdates(query: { page?: number; pageSize?: number }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 10, 50);
    const skip = (page - 1) * take;

    const [data, total] = await Promise.all([
      this.prisma.masterShipment.findMany({
        where: { publicPublished: true },
        skip,
        take,
        select: {
          batchNo: true,
          shipmentType: true,
          status: true,
          publishedAt: true,
          vendorName: true,
          vendorTrackingNo: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { customerShipments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.masterShipment.count({ where: { publicPublished: true } }),
    ]);

    return {
      data: data.map((m) => ({
        batchNo: m.batchNo,
        vendorName: m.vendorName,
        vendorTrackingNo: m.vendorTrackingNo,
        shipmentType: m.shipmentType,
        status: m.status,
        statusLabel: MASTER_SHIPMENT_STATUS_LABELS[m.status] ?? m.status,
        customerShipmentCount: m._count.customerShipments,
        publishedAt: m.publishedAt,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }
}
