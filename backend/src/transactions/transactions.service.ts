import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const VALID_TYPES = ['SHIPPING_FEE', 'REFUND'];

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    customerShipmentId: string;
    type: string;
    amountCents: number;
    adminNote?: string;
  }) {
    if (!VALID_TYPES.includes(dto.type)) {
      throw new BadRequestException(`Invalid type: ${dto.type}. Must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (!Number.isInteger(dto.amountCents) || dto.amountCents <= 0) {
      throw new BadRequestException('amountCents must be a positive integer');
    }

    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.customerShipment.findUnique({
        where: { id: dto.customerShipmentId },
        select: {
          id: true,
          shipmentNo: true,
          customerId: true,
          customer: { select: { id: true, customerCode: true } },
        },
      });
      if (!shipment) throw new NotFoundException('CustomerShipment not found');

      const type = dto.type;
      const created = await tx.transactionRecord.create({
        data: {
          customerId: shipment.customerId,
          customerShipmentId: shipment.id,
          type: type as any,
          amountCents: dto.amountCents,
          adminNote: dto.adminNote,
        },
        select: {
          id: true,
          customerShipmentId: true,
          customerId: true,
          type: true,
          amountCents: true,
          adminNote: true,
          createdAt: true,
          updatedAt: true,
          customerShipment: {
            select: {
              id: true,
              shipmentNo: true,
              customer: { select: { id: true, customerCode: true } },
            },
          },
        },
      });

      if (type === 'SHIPPING_FEE') {
        await tx.customerShipment.update({
          where: { id: shipment.id },
          data: { paymentStatus: PaymentStatus.PAID },
        });
      }

      return created;
    });
  }

  async findAll(query: {
    customerId?: string;
    customerShipmentId?: string;
    type?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.customerId) where.customerId = query.customerId;
    if (query.customerShipmentId) where.customerShipmentId = query.customerShipmentId;
    if (query.type) where.type = query.type;
    if (query.q) {
      where.OR = [
        { adminNote: { contains: query.q, mode: 'insensitive' } },
        { customer: { customerCode: { contains: query.q, mode: 'insensitive' } } },
        { customer: { phoneNumber: { contains: query.q, mode: 'insensitive' } } },
        { customerShipment: { shipmentNo: { contains: query.q, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.transactionRecord.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          customerShipmentId: true,
          customerId: true,
          type: true,
          amountCents: true,
          adminNote: true,
          createdAt: true,
          updatedAt: true,
          customerShipment: {
            select: {
              id: true,
              shipmentNo: true,
              customer: { select: { id: true, customerCode: true } },
            },
          },
        },
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.transactionRecord.count({ where }),
    ]);

    return {
      items: data,
      page,
      pageSize: take,
      total,
      data,
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async findOne(id: string) {
    const tx = await this.prisma.transactionRecord.findUnique({
      where: { id },
      select: {
        id: true,
        customerShipmentId: true,
        customerId: true,
        type: true,
        amountCents: true,
        adminNote: true,
        createdAt: true,
        updatedAt: true,
        customerShipment: {
          select: {
            id: true,
            shipmentNo: true,
            customer: { select: { id: true, customerCode: true } },
          },
        },
      },
    });
    if (!tx) throw new NotFoundException('TransactionRecord not found');
    return { data: tx };
  }

  async update(
    id: string,
    dto: {
      type?: string;
      amountCents?: number;
      adminNote?: string;
      occurredAt?: string;
    },
  ) {
    const tx = await this.prisma.transactionRecord.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('TransactionRecord not found');

    if (dto.type && !VALID_TYPES.includes(dto.type)) {
      throw new BadRequestException(`Invalid type: ${dto.type}. Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    const updated = await this.prisma.transactionRecord.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type as any }),
        ...(dto.amountCents !== undefined && { amountCents: dto.amountCents }),
        ...(dto.adminNote !== undefined && { adminNote: dto.adminNote }),
        ...(dto.occurredAt !== undefined && { occurredAt: new Date(dto.occurredAt) }),
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

    const tx = await this.prisma.transactionRecord.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('TransactionRecord not found');

    await this.prisma.transactionRecord.delete({ where: { id } });
    return { deleted: true, id };
  }
}
