import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VALID_TYPES = ['SHIPPING_FEE', 'REFUND'];

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: {
    customerId: string;
    customerShipmentId: string;
    type?: string;
    amountCents: number;
    adminNote?: string;
    occurredAt?: string;
  }) {
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const shipment = await this.prisma.customerShipment.findUnique({
      where: { id: dto.customerShipmentId },
    });
    if (!shipment) throw new NotFoundException('CustomerShipment not found');
    if (shipment.customerId !== dto.customerId) {
      throw new BadRequestException('CustomerShipment does not belong to this customer');
    }

    if (dto.type && !VALID_TYPES.includes(dto.type)) {
      throw new BadRequestException(`Invalid type: ${dto.type}. Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    return this.prisma.transactionRecord.create({
      data: {
        customerId: dto.customerId,
        customerShipmentId: dto.customerShipmentId,
        type: (dto.type as any) || 'REFUND',
        amountCents: dto.amountCents,
        adminNote: dto.adminNote,
        occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
      },
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
        include: {
          customer: { select: { id: true, customerCode: true, wechatId: true } },
          customerShipment: { select: { id: true, shipmentNo: true, status: true } },
        },
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.transactionRecord.count({ where }),
    ]);

    return {
      data,
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async findOne(id: string) {
    const tx = await this.prisma.transactionRecord.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, customerCode: true, wechatId: true, phoneCountryCode: true, phoneNumber: true } },
        customerShipment: { select: { id: true, shipmentNo: true, status: true } },
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
