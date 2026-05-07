import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CUSTOMER_SHIPMENT_STATUS_LABELS } from '../common/status-labels';

function generateShipmentNo(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900).toString();
  return `GJS${y}${m}${d}${rand}`;
}

const VALID_STATUSES = [
  'PACKED', 'SHIPPED', 'ARRIVED', 'READY_FOR_PICKUP', 'PICKED_UP', 'EXCEPTION',
];

const VALID_PAYMENT_STATUSES = ['UNPAID', 'PROCESSING', 'PENDING', 'PAID', 'WAIVED', 'REFUNDED'];
const BLOCKED_ITEM_MUTATION_STATUSES = ['SHIPPED', 'ARRIVED', 'READY_FOR_PICKUP', 'PICKED_UP'];

function assertCustomerShipmentStatus(status: string) {
  if (!VALID_STATUSES.includes(status)) {
    throw new BadRequestException(
      `Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`,
    );
  }
}

function normalizeQuantity(quantity?: number): number {
  const value = quantity === undefined ? 1 : Number(quantity);
  if (!Number.isInteger(value) || value < 1) {
    throw new BadRequestException('quantity must be an integer greater than or equal to 1');
  }
  return value;
}

function formatCustomerShipment(shipment: any) {
  return {
    ...shipment,
    statusText: CUSTOMER_SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status,
    itemCount: shipment.itemCount ?? shipment._count?.items,
    _count: undefined,
  };
}

@Injectable()
export class CustomerShipmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    customerId: string;
    inboundPackageIds?: string[];
    quantity?: number;
    notes?: string;
    actualWeightKg?: string;
    volumeFormula?: string;
    billingRateCnyPerKg?: string;
    billingWeightKg?: string;
  }) {
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    let shipmentNo: string;
    for (let i = 0; i < 20; i++) {
      shipmentNo = generateShipmentNo();
      const exists = await this.prisma.customerShipment.findUnique({ where: { shipmentNo } });
      if (!exists) break;
      if (i === 19) throw new BadRequestException('Failed to generate unique shipmentNo');
    }

    const packageIds = dto.inboundPackageIds ?? [];
    const quantity = normalizeQuantity(dto.quantity);
    if (packageIds.length > 0) {
      const pkgs = await this.prisma.inboundPackage.findMany({
        where: { id: { in: packageIds } },
        include: { shipmentItems: true },
      });

      if (pkgs.length !== packageIds.length) {
        throw new NotFoundException('One or more InboundPackage IDs not found');
      }

      const alreadyInShipment = pkgs.filter((p) => p.shipmentItems.length > 0);
      if (alreadyInShipment.length > 0) {
        throw new ConflictException(
          `Packages already in another shipment: ${alreadyInShipment.map((p) => p.id).join(', ')}`,
        );
      }

      const wrongCustomer = pkgs.filter(
        (p) => p.customerId !== null && p.customerId !== dto.customerId,
      );
      if (wrongCustomer.length > 0) {
        throw new ConflictException(
          `Packages belong to a different customer: ${wrongCustomer.map((p) => p.id).join(', ')}`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.customerShipment.create({
        data: {
          shipmentNo: shipmentNo!,
          customerId: dto.customerId,
          quantity,
          notes: dto.notes,
          ...(dto.actualWeightKg !== undefined && { actualWeightKg: dto.actualWeightKg }),
          ...(dto.volumeFormula !== undefined && { volumeFormula: dto.volumeFormula }),
          ...(dto.billingRateCnyPerKg !== undefined && { billingRateCnyPerKg: dto.billingRateCnyPerKg }),
          ...(dto.billingWeightKg !== undefined && { billingWeightKg: dto.billingWeightKg }),
          items: packageIds.length > 0
            ? {
                create: packageIds.map((id) => ({ inboundPackageId: id })),
              }
            : undefined,
        },
        include: {
          customer: { select: { id: true, customerCode: true, wechatId: true } },
          items: { include: { inboundPackage: { select: { id: true, domesticTrackingNo: true, status: true } } } },
        },
      });

      if (packageIds.length > 0) {
        await tx.inboundPackage.updateMany({
          where: { id: { in: packageIds } },
          data: { status: 'CONSOLIDATED' },
        });
      }

      return { data: formatCustomerShipment(shipment) };
    });
  }

  async findAll(query: {
    q?: string;
    status?: string;
    paymentStatus?: string;
    customerId?: string;
    masterShipmentId?: string;
    unbatched?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.status) {
      assertCustomerShipmentStatus(query.status);
      where.status = query.status;
    }
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.customerId) where.customerId = query.customerId;
    if (query.masterShipmentId) where.masterShipmentId = query.masterShipmentId;
    if (query.unbatched === 'true') where.masterShipmentId = null;
    if (query.q) {
      where.OR = [
        { shipmentNo: { contains: query.q, mode: 'insensitive' } },
        { customer: { customerCode: { contains: query.q, mode: 'insensitive' } } },
        { customer: { phoneNumber: { contains: query.q } } },
        { customer: { wechatId: { contains: query.q, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customerShipment.findMany({
        where,
        skip,
        take,
        include: {
          customer: { select: { id: true, customerCode: true, wechatId: true } },
          masterShipment: { select: { id: true, batchNo: true, status: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customerShipment.count({ where }),
    ]);

    return {
      items: data.map((s) => formatCustomerShipment(s)),
      page,
      pageSize: take,
      total,
    };
  }

  async findOne(id: string) {
    const shipment = await this.prisma.customerShipment.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, customerCode: true, wechatId: true, phoneCountryCode: true, phoneNumber: true } },
        masterShipment: { select: { id: true, batchNo: true, status: true, vendorName: true } },
        items: {
          include: {
            inboundPackage: {
              select: { id: true, domesticTrackingNo: true, status: true },
            },
          },
        },
        transactions: {
          select: { id: true, type: true, amountCents: true, occurredAt: true },
        },
      },
    });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');
    return { data: formatCustomerShipment(shipment) };
  }

  async update(
    id: string,
    dto: {
      notes?: string;
      internationalTrackingNo?: string;
      publicTrackingEnabled?: boolean;
      status?: string;
      paymentStatus?: string;
      quantity?: number;
      actualWeightKg?: string;
      volumeFormula?: string;
      billingRateCnyPerKg?: string;
      billingWeightKg?: string;
    },
  ) {
    const shipment = await this.prisma.customerShipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    if (dto.status) assertCustomerShipmentStatus(dto.status);
    if (dto.paymentStatus && !VALID_PAYMENT_STATUSES.includes(dto.paymentStatus)) {
      throw new BadRequestException(`Invalid paymentStatus: ${dto.paymentStatus}`);
    }

    const now = new Date();
    const timestamps: any = {};
    if (dto.status) {
      if (dto.status === 'SHIPPED' && !shipment.sentToOverseasAt) timestamps.sentToOverseasAt = now;
      if (dto.status === 'ARRIVED' && !shipment.arrivedOverseasAt) timestamps.arrivedOverseasAt = now;
      if (dto.status === 'READY_FOR_PICKUP' && !shipment.localDeliveryRequestedAt) timestamps.localDeliveryRequestedAt = now;
      if (dto.status === 'PICKED_UP' && !shipment.pickedUpAt) timestamps.pickedUpAt = now;
    }

    const updated = await this.prisma.customerShipment.update({
      where: { id },
      data: {
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.internationalTrackingNo !== undefined && { internationalTrackingNo: dto.internationalTrackingNo }),
        ...(dto.publicTrackingEnabled !== undefined && { publicTrackingEnabled: dto.publicTrackingEnabled }),
        ...(dto.status !== undefined && { status: dto.status as any }),
        ...(dto.paymentStatus !== undefined && { paymentStatus: dto.paymentStatus as any }),
        ...(dto.quantity !== undefined && { quantity: normalizeQuantity(dto.quantity) }),
        ...(dto.actualWeightKg !== undefined && { actualWeightKg: dto.actualWeightKg }),
        ...(dto.volumeFormula !== undefined && { volumeFormula: dto.volumeFormula }),
        ...(dto.billingRateCnyPerKg !== undefined && { billingRateCnyPerKg: dto.billingRateCnyPerKg }),
        ...(dto.billingWeightKg !== undefined && { billingWeightKg: dto.billingWeightKg }),
        ...timestamps,
      },
      include: {
        customer: { select: { id: true, customerCode: true, wechatId: true } },
      },
    });
    return { data: formatCustomerShipment(updated) };
  }

  async hardDelete(id: string, confirm: string) {
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException(
        'Must pass confirm=DELETE_HARD query param to confirm hard delete',
      );
    }

    const shipment = await this.prisma.customerShipment.findUnique({
      where: { id },
      include: {
        _count: { select: { items: true, transactions: true } },
      },
    });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    if (BLOCKED_ITEM_MUTATION_STATUSES.includes(shipment.status)) {
      throw new ConflictException(
        `Cannot hard delete shipment with status ${shipment.status}. Shipment is in transit or completed.`,
      );
    }

    if (shipment.masterShipmentId) {
      throw new ConflictException(
        'Cannot hard delete shipment that is linked to a MasterShipment. Remove it from the batch first.',
      );
    }

    if (shipment._count.transactions > 0) {
      throw new ConflictException({
        message: 'Cannot hard delete shipment with related transaction records',
        blockers: { transactions: shipment._count.transactions },
      });
    }

    await this.prisma.$transaction(async (tx) => {
      if (shipment._count.items > 0) {
        const items = await tx.customerShipmentItem.findMany({
          where: { customerShipmentId: id },
        });
        await tx.customerShipmentItem.deleteMany({ where: { customerShipmentId: id } });
        await tx.inboundPackage.updateMany({
          where: { id: { in: items.map((i) => i.inboundPackageId) } },
          data: { status: 'ARRIVED' },
        });
      }
      await tx.customerShipment.delete({ where: { id } });
    });

    return { deleted: true, id };
  }

  async cancel(id: string) {
    const shipment = await this.prisma.customerShipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    if (BLOCKED_ITEM_MUTATION_STATUSES.includes(shipment.status)) {
      throw new ConflictException(
        `Cannot cancel shipment with status ${shipment.status}. Shipment is already in transit or completed.`,
      );
    }

    const items = await this.prisma.customerShipmentItem.findMany({
      where: { customerShipmentId: id },
    });

    await this.prisma.$transaction(async (tx) => {
      if (items.length > 0) {
        await tx.inboundPackage.updateMany({
          where: { id: { in: items.map((i) => i.inboundPackageId) } },
          data: { status: 'ARRIVED' },
        });
      }
      await tx.customerShipment.update({
        where: { id },
        data: { status: 'EXCEPTION' },
      });
    });

    return { data: { id, status: 'EXCEPTION', cancelled: true, message: 'Shipment cancelled (status set to EXCEPTION)' } };
  }

  async updateStatus(id: string, status: string, forcedAt?: string) {
    assertCustomerShipmentStatus(status);

    const shipment = await this.prisma.customerShipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    const now = forcedAt ? new Date(forcedAt) : new Date();
    const timestamps: any = {};
    if (status === 'SHIPPED' && !shipment.sentToOverseasAt) timestamps.sentToOverseasAt = now;
    if (status === 'ARRIVED' && !shipment.arrivedOverseasAt) timestamps.arrivedOverseasAt = now;
    if (status === 'READY_FOR_PICKUP' && !shipment.localDeliveryRequestedAt) timestamps.localDeliveryRequestedAt = now;
    if (status === 'PICKED_UP' && !shipment.pickedUpAt) timestamps.pickedUpAt = now;

    const updated = await this.prisma.customerShipment.update({
      where: { id },
      data: { status: status as any, ...timestamps },
    });
    return {
      data: {
        id: updated.id,
        status: updated.status,
        statusText: CUSTOMER_SHIPMENT_STATUS_LABELS[updated.status],
        updatedAt: updated.updatedAt,
        ...timestamps,
      },
    };
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      throw new BadRequestException(`Invalid paymentStatus: ${paymentStatus}`);
    }

    const shipment = await this.prisma.customerShipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    const updated = await this.prisma.customerShipment.update({
      where: { id },
      data: { paymentStatus: paymentStatus as any },
    });
    return { data: { id: updated.id, paymentStatus: updated.paymentStatus, updatedAt: updated.updatedAt } };
  }

  async addItem(shipmentId: string, inboundPackageId: string) {
    const shipment = await this.prisma.customerShipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    const pkg = await this.prisma.inboundPackage.findUnique({
      where: { id: inboundPackageId },
      include: { shipmentItems: true },
    });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    if (pkg.customerId && pkg.customerId !== shipment.customerId) {
      throw new ConflictException('Package belongs to a different customer');
    }

    if (pkg.shipmentItems.length > 0) {
      throw new ConflictException('Package is already in a shipment');
    }

    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.customerShipmentItem.create({
        data: { customerShipmentId: shipmentId, inboundPackageId },
        include: { inboundPackage: { select: { id: true, domesticTrackingNo: true } } },
      });
      await tx.inboundPackage.update({
        where: { id: inboundPackageId },
        data: { status: 'CONSOLIDATED' },
      });
      return created;
    });
    return { data: item };
  }

  async removeItem(shipmentId: string, itemId: string) {
    const shipment = await this.prisma.customerShipment.findUnique({ where: { id: shipmentId } });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    if (BLOCKED_ITEM_MUTATION_STATUSES.includes(shipment.status)) {
      throw new ConflictException(
        `Cannot remove item from shipment with status ${shipment.status}`,
      );
    }

    const item = await this.prisma.customerShipmentItem.findFirst({
      where: { id: itemId, customerShipmentId: shipmentId },
    });
    if (!item) throw new NotFoundException('Item not found in this shipment');

    await this.prisma.$transaction(async (tx) => {
      await tx.customerShipmentItem.delete({ where: { id: itemId } });
      await tx.inboundPackage.update({
        where: { id: item.inboundPackageId },
        data: { status: 'ARRIVED' },
      });
    });

    return { data: { removed: itemId } };
  }

  async getImages(id: string) {
    const shipment = await this.prisma.customerShipment.findUnique({
      where: { id },
      select: { id: true, imageUrls: true },
    });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');
    return { items: shipment.imageUrls };
  }

  async addImage(id: string, imageUrl: string) {
    const shipment = await this.prisma.customerShipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    const updated = await this.prisma.customerShipment.update({
      where: { id },
      data: { imageUrls: { push: imageUrl } },
    });
    return { url: imageUrl, imageUrls: updated.imageUrls };
  }

  async removeImage(id: string, imageUrl: string, confirm: string) {
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException('Must pass confirm=DELETE_HARD to confirm image deletion');
    }

    const shipment = await this.prisma.customerShipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');

    if (!shipment.imageUrls.includes(imageUrl)) {
      throw new BadRequestException('imageUrl not found in this shipment');
    }

    const updated = await this.prisma.customerShipment.update({
      where: { id },
      data: { imageUrls: shipment.imageUrls.filter((u) => u !== imageUrl) },
    });
    return { deleted: true, url: imageUrl, imageUrls: updated.imageUrls };
  }
}
