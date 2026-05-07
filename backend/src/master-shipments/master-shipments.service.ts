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
  'CREATED', 'HANDED_TO_VENDOR', 'IN_TRANSIT',
  'TRANSFER_OR_CUSTOMS_PROCESSING', 'ARRIVED_OVERSEAS', 'CLOSED', 'EXCEPTION',
];
const VALID_SHIPMENT_TYPES = ['AIR_GENERAL', 'AIR_SENSITIVE', 'SEA'];

@Injectable()
export class MasterShipmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    shipmentType?: string;
    vendorName: string;
    vendorTrackingNo: string;
    customerShipmentIds: string[];
    status?: string;
    adminNote?: string;
  }) {
    if (!dto.vendorName || !dto.vendorTrackingNo) {
      throw new BadRequestException('vendorName and vendorTrackingNo are required');
    }
    if (!dto.customerShipmentIds || dto.customerShipmentIds.length === 0) {
      throw new BadRequestException('customerShipmentIds is required and must not be empty');
    }
    if (dto.shipmentType && !VALID_SHIPMENT_TYPES.includes(dto.shipmentType)) {
      throw new BadRequestException(`Invalid shipmentType: ${dto.shipmentType}`);
    }

    const ids = dto.customerShipmentIds;
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length !== ids.length) {
      throw new BadRequestException('customerShipmentIds contains duplicate values');
    }

    const shipments = await this.prisma.customerShipment.findMany({
      where: { id: { in: uniqueIds } },
    });
    if (shipments.length !== uniqueIds.length) {
      const foundIds = new Set(shipments.map((s) => s.id));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(`CustomerShipment IDs not found: ${missing.join(', ')}`);
    }

    const alreadyBatched = shipments.filter((s) => s.masterShipmentId !== null);
    if (alreadyBatched.length > 0) {
      throw new ConflictException(
        `CustomerShipments already belong to another batch: ${alreadyBatched.map((s) => s.id).join(', ')}`,
      );
    }

    let batchNo: string;
    for (let i = 0; i < 20; i++) {
      batchNo = generateBatchNo();
      const exists = await this.prisma.masterShipment.findUnique({ where: { batchNo } });
      if (!exists) break;
      if (i === 19) throw new BadRequestException('Failed to generate unique batchNo');
    }

    return this.prisma.$transaction(async (tx) => {
      const master = await tx.masterShipment.create({
        data: {
          batchNo: batchNo!,
          shipmentType: dto.shipmentType || 'AIR_GENERAL',
          vendorName: dto.vendorName,
          vendorTrackingNo: dto.vendorTrackingNo,
          status: (dto.status as any) || 'CREATED',
          adminNote: dto.adminNote,
        },
      });

      await tx.customerShipment.updateMany({
        where: { id: { in: uniqueIds } },
        data: { masterShipmentId: master.id },
      });

      const result = await tx.masterShipment.findUnique({
        where: { id: master.id },
        include: {
          customerShipments: {
            select: {
              id: true,
              shipmentNo: true,
              status: true,
              paymentStatus: true,
              customer: { select: { id: true, customerCode: true } },
            },
          },
        },
      });

      return { data: result };
    });
  }

  async findAll(query: {
    q?: string;
    status?: string;
    publicVisible?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.publicVisible !== undefined) {
      where.publicVisible = query.publicVisible === 'true';
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
          customerShipments: {
            select: {
              id: true,
              shipmentNo: true,
              status: true,
              paymentStatus: true,
              customerId: true,
              customer: { select: { id: true, customerCode: true } },
            },
          },
          publicVisible: true,
          publicTitle: true,
          publicStatusText: true,
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
        customerShipments: {
          select: {
            id: true,
            shipmentNo: true,
            status: true,
            paymentStatus: true,
            customerId: true,
            customer: { select: { id: true, customerCode: true } },
          },
        },
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
    if (status === 'HANDED_TO_VENDOR' && !master.handedToVendorAt) timestamps.handedToVendorAt = now;
    if (status === 'ARRIVED_OVERSEAS' && !master.arrivedOverseasAt) timestamps.arrivedOverseasAt = now;
    if (status === 'CLOSED' && !master.closedAt) timestamps.closedAt = now;

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
      adminNote?: string;
      publicTitle?: string;
      publicSummary?: string;
      publicStatusText?: string;
      publicVisible?: boolean;
    },
  ) {
    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');
    if (dto.shipmentType && !VALID_SHIPMENT_TYPES.includes(dto.shipmentType)) {
      throw new BadRequestException(`Invalid shipmentType: ${dto.shipmentType}`);
    }

    const publishedAt =
      dto.publicVisible === true && !master.publishedAt ? new Date() : undefined;

    const updated = await this.prisma.masterShipment.update({
      where: { id },
      data: {
        ...(dto.shipmentType !== undefined && { shipmentType: dto.shipmentType }),
        ...(dto.vendorName !== undefined && { vendorName: dto.vendorName }),
        ...(dto.vendorTrackingNo !== undefined && { vendorTrackingNo: dto.vendorTrackingNo }),
        ...(dto.adminNote !== undefined && { adminNote: dto.adminNote }),
        ...(dto.publicTitle !== undefined && { publicTitle: dto.publicTitle }),
        ...(dto.publicSummary !== undefined && { publicSummary: dto.publicSummary }),
        ...(dto.publicStatusText !== undefined && { publicStatusText: dto.publicStatusText }),
        ...(dto.publicVisible !== undefined && { publicVisible: dto.publicVisible }),
        ...(publishedAt && { publishedAt }),
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

    const master = await this.prisma.masterShipment.findUnique({
      where: { id },
      include: { _count: { select: { customerShipments: true } } },
    });
    if (!master) throw new NotFoundException('MasterShipment not found');

    if (master.status !== 'CREATED') {
      throw new ConflictException(
        `Cannot hard delete master shipment with status ${master.status}. Only CREATED batches may be deleted.`,
      );
    }

    const shipmentCount = master._count.customerShipments;
    if (shipmentCount > 0) {
      throw new ConflictException({
        message: 'Cannot hard delete master shipment with related customer shipments',
        blockers: { customerShipments: shipmentCount },
      });
    }

    await this.prisma.masterShipment.delete({ where: { id } });
    return { deleted: true, id };
  }

  async addCustomerShipments(id: string, customerShipmentIds: string[]) {
    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');

    const shipments = await this.prisma.customerShipment.findMany({
      where: { id: { in: customerShipmentIds } },
    });

    if (shipments.length !== customerShipmentIds.length) {
      throw new NotFoundException('One or more CustomerShipment IDs not found');
    }

    const alreadyLinked = shipments.filter(
      (s) => s.masterShipmentId && s.masterShipmentId !== id,
    );
    if (alreadyLinked.length > 0) {
      throw new ConflictException(
        `Shipments already belong to another MasterShipment: ${alreadyLinked.map((s) => s.id).join(', ')}`,
      );
    }

    await this.prisma.customerShipment.updateMany({
      where: { id: { in: customerShipmentIds } },
      data: { masterShipmentId: id },
    });

    return { data: { masterShipmentId: id, addedCount: customerShipmentIds.length } };
  }

  async removeCustomerShipment(id: string, customerShipmentId: string) {
    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');

    const blockedStatuses = ['HANDED_TO_VENDOR', 'IN_TRANSIT', 'TRANSFER_OR_CUSTOMS_PROCESSING',
      'ARRIVED_OVERSEAS', 'CLOSED'];
    if (blockedStatuses.includes(master.status)) {
      throw new ConflictException(
        `Cannot remove shipment from batch with status ${master.status}`,
      );
    }

    const shipment = await this.prisma.customerShipment.findFirst({
      where: { id: customerShipmentId, masterShipmentId: id },
    });
    if (!shipment) throw new NotFoundException('CustomerShipment not found in this MasterShipment');

    await this.prisma.customerShipment.update({
      where: { id: customerShipmentId },
      data: { masterShipmentId: null },
    });

    return { data: { removed: customerShipmentId } };
  }

  async updatePublication(
    id: string,
    dto: {
      publicVisible?: boolean;
      publicTitle?: string;
      publicSummary?: string;
      publicStatusText?: string;
    },
  ) {
    const master = await this.prisma.masterShipment.findUnique({ where: { id } });
    if (!master) throw new NotFoundException('MasterShipment not found');

    const publishedAt =
      dto.publicVisible === true && !master.publishedAt ? new Date() : undefined;

    const updated = await this.prisma.masterShipment.update({
      where: { id },
      data: {
        publicVisible: dto.publicVisible,
        publicTitle: dto.publicTitle,
        publicSummary: dto.publicSummary,
        publicStatusText: dto.publicStatusText,
        ...(publishedAt && { publishedAt }),
      },
      select: {
        id: true,
        batchNo: true,
        status: true,
        publicVisible: true,
        publicTitle: true,
        publicSummary: true,
        publicStatusText: true,
        publishedAt: true,
        updatedAt: true,
      },
    });
    return { data: updated };
  }
}
