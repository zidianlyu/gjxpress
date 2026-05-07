import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function normalizeOptionalString(value?: string | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const transactionSelect = {
  id: true,
  customerShipmentId: true,
  customerId: true,
  amountCents: true,
  adminNote: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      customerCode: true,
    },
  },
  customerShipment: {
    select: {
      id: true,
      shipmentNo: true,
      shipmentType: true,
      paymentStatus: true,
      customer: { select: { id: true, customerCode: true } },
    },
  },
} as const;

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    customerShipmentId: string;
    amountCents: number;
    adminNote?: string;
  }) {
    if (!Number.isInteger(dto.amountCents) || dto.amountCents <= 0) {
      throw new BadRequestException('amountCents must be a positive integer');
    }

    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.customerShipment.findUnique({
        where: { id: dto.customerShipmentId },
        select: {
          id: true,
          shipmentNo: true,
          shipmentType: true,
          customerId: true,
          customer: { select: { id: true, customerCode: true } },
        },
      });
      if (!shipment) throw new NotFoundException('CustomerShipment not found');

      const created = await tx.transactionRecord.create({
        data: {
          customerId: shipment.customerId,
          customerShipmentId: shipment.id,
          amountCents: dto.amountCents,
          adminNote: normalizeOptionalString(dto.adminNote),
        },
        select: { id: true },
      });

      await tx.customerShipment.update({
        where: { id: shipment.id },
        data: { paymentStatus: PaymentStatus.PAID },
      });

      const result = await tx.transactionRecord.findUnique({
        where: { id: created.id },
        select: transactionSelect,
      });

      return { data: result };
    });
  }

  async findAll(query: {
    customerId?: string;
    customerShipmentId?: string;
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
        select: transactionSelect,
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
      select: transactionSelect,
    });
    if (!tx) throw new NotFoundException('TransactionRecord not found');
    return { data: tx };
  }

  async update(
    id: string,
    dto: {
      adminNote?: string;
    },
  ) {
    const tx = await this.prisma.transactionRecord.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('TransactionRecord not found');

    const updated = await this.prisma.transactionRecord.update({
      where: { id },
      data: {
        ...(dto.adminNote !== undefined && { adminNote: normalizeOptionalString(dto.adminNote) }),
      },
      select: transactionSelect,
    });
    return { data: updated };
  }

  async hardDelete(id: string, confirm: string) {
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException(
        'Must pass confirm=DELETE_HARD query param to confirm hard delete',
      );
    }

    return this.prisma.$transaction(async (prismaTx) => {
      const tx = await prismaTx.transactionRecord.findUnique({
        where: { id },
        select: { id: true, customerShipmentId: true },
      });
      if (!tx) throw new NotFoundException('TransactionRecord not found');
      if (!tx.customerShipmentId) {
        throw new ConflictException('TransactionRecord has no customerShipmentId');
      }

      const shipment = await prismaTx.customerShipment.findUnique({
        where: { id: tx.customerShipmentId },
        select: { id: true },
      });
      if (!shipment) throw new NotFoundException('CustomerShipment not found for TransactionRecord');

      await prismaTx.transactionRecord.delete({ where: { id } });
      const updatedShipment = await prismaTx.customerShipment.update({
        where: { id: tx.customerShipmentId },
        data: { paymentStatus: PaymentStatus.UNPAID },
        select: { paymentStatus: true },
      });

      return {
        deleted: true,
        id,
        customerShipmentId: tx.customerShipmentId,
        updatedPaymentStatus: updatedShipment.paymentStatus,
      };
    });
  }
}
