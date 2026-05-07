import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function generateBatchNo(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900).toString();
  return `GJB${y}${m}${d}${rand}`;
}

const VALID_STATUSES = [
  'IN_TRANSIT', 'SIGNED', 'READY_FOR_PICKUP', 'EXCEPTION',
];
const VALID_SHIPMENT_TYPES = ['AIR_GENERAL', 'AIR_SENSITIVE', 'SEA'];
const VALID_VENDOR_NAMES = ['DHL', 'UPS', 'FEDEX', 'EMS', 'OTHER'];
const CUSTOMER_SHIPMENT_SELECT = {
  id: true,
  shipmentNo: true,
  shipmentType: true,
  status: true,
  paymentStatus: true,
  customer: { select: { id: true, customerCode: true } },
} as const;

function normalizeVendorName(value?: string | null): string {
  const normalized = value?.trim().toUpperCase();
  if (!normalized) {
    throw new BadRequestException('vendorName is required');
  }
  if (!VALID_VENDOR_NAMES.includes(normalized)) {
    throw new BadRequestException(`Invalid vendorName: ${value}. Must be one of: ${VALID_VENDOR_NAMES.join(', ')}`);
  }
  return normalized;
}

@Injectable()
export class MasterShipmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    shipmentType?: string;
    vendorName: string;
    vendorTrackingNo: string;
    customerShipmentIds: string[];
    publicPublished?: boolean;
    note?: string;
  }) {
    const vendorName = normalizeVendorName(dto.vendorName);
    if (!dto.vendorTrackingNo || dto.vendorTrackingNo.trim().length === 0) {
      throw new BadRequestException('vendorTrackingNo is required');
    }
    if (!dto.customerShipmentIds || dto.customerShipmentIds.length === 0) {
      throw new BadRequestException('customerShipmentIds is required and must not be empty');
    }
    if (dto.shipmentType && !VALID_SHIPMENT_TYPES.includes(dto.shipmentType)) {
      throw new BadRequestException(`Invalid shipmentType: ${dto.shipmentType}`);
    }
    const shipmentType = dto.shipmentType || 'AIR_GENERAL';

    const ids = dto.customerShipmentIds;
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      throw new BadRequestException('customerShipmentIds contains duplicate values');
    }

    return this.prisma.$transaction(async (tx) => {
      const shipments = await tx.customerShipment.findMany({
        where: { id: { in: uniqueIds } },
      });
      if (shipments.length !== uniqueIds.length) {
        const foundIds = new Set(shipments.map((s) => s.id));
        const missing = uniqueIds.filter((id) => !foundIds.has(id));
        throw new NotFoundException(`CustomerShipment IDs not found: ${missing.join(', ')}`);
      }

      const alreadyBatched = shipments.filter((s) => s.masterShipmentId !== null);
      if (alreadyBatched.length > 0) {
        throw new ConflictException('所选集运单已关联其他批次。');
      }

      const typeMismatched = shipments.filter((s) => s.shipmentType !== shipmentType);
      if (typeMismatched.length > 0) {
        throw new BadRequestException('所选集运单运输类型与批次运输类型不一致。');
      }

      const unpaid = shipments.filter((s) => s.paymentStatus !== 'PAID');
      if (unpaid.length > 0) {
        throw new ConflictException('所选集运单中存在未支付订单，请先完成支付后再创建批次。');
      }

      let batchNo: string;
      for (let i = 0; i < 20; i++) {
        batchNo = generateBatchNo();
        const exists = await tx.masterShipment.findUnique({ where: { batchNo } });
        if (!exists) break;
        if (i === 19) throw new BadRequestException('Failed to generate unique batchNo');
      }

      const master = await tx.masterShipment.create({
        data: {
          batchNo: batchNo!,
          shipmentType,
          vendorName,
          vendorTrackingNo: dto.vendorTrackingNo,
          status: 'IN_TRANSIT',
          publicPublished: dto.publicPublished ?? true,
          note: dto.note,
        },
      });

      await tx.customerShipment.updateMany({
        where: { id: { in: uniqueIds } },
        data: { masterShipmentId: master.id, status: 'SHIPPED' },
      });

      const result = await tx.masterShipment.findUnique({
        where: { id: master.id },
        include: {
          customerShipments: { select: CUSTOMER_SHIPMENT_SELECT },
        },
      });

      return { data: result };
    });
  }

  async findAll(query: {
    q?: string;
    status?: string;
    publicPublished?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.status) {
      if (!VALID_STATUSES.includes(query.status)) {
        throw new BadRequestException(`Invalid status: ${query.status}`);
      }
      where.status = query.status;
    }
    if (query.publicPublished !== undefined) {
      where.publicPublished = query.publicPublished === 'true';
    }
    if (query.q) {
      where.OR = [
        { batchNo: { contains: query.q, mode: 'insensitive' } },
        { vendorName: { contains: query.q, mode: 'insensitive' } },
        { vendorTrackingNo: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.masterShipment.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          batchNo: true,
          shipmentType: true,
          vendorName: true,
          vendorTrackingNo: true,
          status: true,
          customerShipments: { select: CUSTOMER_SHIPMENT_SELECT },
          publicPublished: true,
          note: true,
          publishedAt: true,
          handedToVendorAt: true,
          arrivedOverseasAt: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { customerShipments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.masterShipment.count({ where }),
    ]);

    return {
      data: data.map((m) => ({ ...m, shipmentCount: m._count.customerShipments, _count: undefined })),
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async findOne(id: string) {
    const master = await this.prisma.masterShipment.findUnique({
      where: { id },
      include: {
        customerShipments: { select: CUSTOMER_SHIPMENT_SELECT },
      },
    });
    if (!master) throw new NotFoundException('MasterShipment not found');
    return { data: master };
  }

  async updateStatus(id: string, status: string) {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');

    const now = new Date();
    const timestamps: any = {};
    if (status === 'SIGNED' && !master.arrivedOverseasAt) timestamps.arrivedOverseasAt = now;

    const updated = await this.prisma.masterShipment.update({
      where: { id },
      data: { status: status as any, ...timestamps },
    });
    return { data: { id: updated.id, status: updated.status, updatedAt: updated.updatedAt, ...timestamps } };
  }

  async update(
    id: string,
    dto: {
      shipmentType?: string;
      vendorName?: string;
      vendorTrackingNo?: string;
      note?: string;
      publicPublished?: boolean;
      status?: string;
    },
  ) {
    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');
    if (dto.status && !VALID_STATUSES.includes(dto.status)) {
      throw new BadRequestException(`Invalid status: ${dto.status}`);
    }

    const publishedAt =
      dto.publicPublished === true && !master.publishedAt ? new Date() : undefined;

    const updated = await this.prisma.masterShipment.update({
      where: { id },
      data: {
        ...(dto.note !== undefined && { note: dto.note }),
        ...(dto.publicPublished !== undefined && { publicPublished: dto.publicPublished }),
        ...(dto.status !== undefined && { status: dto.status as any }),
        ...(publishedAt && { publishedAt }),
      },
      include: {
        customerShipments: { select: CUSTOMER_SHIPMENT_SELECT },
      },
    });
    return { data: updated };
  }

  async hardDelete(id: string, confirm: string) {
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException(
        'Must pass confirm=DELETE_HARD query param to confirm hard delete',
      );
    }

    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');

    return this.prisma.$transaction(async (tx) => {
      const detached = await tx.customerShipment.updateMany({
        where: { masterShipmentId: id },
        data: { masterShipmentId: null },
      });
      await tx.masterShipment.delete({ where: { id } });
      return { deleted: true, id, detachedCustomerShipmentCount: detached.count };
    });
  }

  async addCustomerShipments(id: string, customerShipmentIds: string[]) {
    void customerShipmentIds;
    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');
    throw new BadRequestException('批次关联集运单创建后只读，不能追加。');
  }

  async removeCustomerShipment(id: string, customerShipmentId: string) {
    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');

    void customerShipmentId;
    throw new BadRequestException('批次关联集运单创建后只读，不能移除。');
  }

  async updatePublication(
    id: string,
    dto: {
      publicPublished?: boolean;
    },
  ) {
    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');

    const publishedAt =
      dto.publicPublished === true && !master.publishedAt ? new Date() : undefined;

    const updated = await this.prisma.masterShipment.update({
      where: { id },
      data: {
        publicPublished: dto.publicPublished,
        ...(publishedAt && { publishedAt }),
      },
      select: {
        id: true,
        batchNo: true,
        status: true,
        publicPublished: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
    return { data: updated };
  }
}
