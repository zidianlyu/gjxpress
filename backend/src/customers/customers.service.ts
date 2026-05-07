import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

const CUSTOMER_LIST_SELECT = {
  id: true,
  customerCode: true,
  phoneCountryCode: true,
  phoneNumber: true,
  wechatId: true,
  domesticReturnAddress: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const VALID_CUSTOMER_STATUSES = ['ACTIVE', 'DISABLED'];
const MAX_CODE_RETRIES = 50;

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const countryCode = dto.phoneCountryCode || '+86';
    const existing = await this.prisma.customer.findFirst({
      where: { phoneCountryCode: countryCode, phoneNumber: dto.phoneNumber },
    });
    if (existing) {
      throw new ConflictException(
        `A customer with phone ${countryCode} ${dto.phoneNumber} already exists`,
      );
    }

    const customerCode = await this.generateUniqueCustomerCode();
    return this.prisma.customer.create({
      data: {
        customerCode,
        phoneCountryCode: countryCode,
        phoneNumber: dto.phoneNumber,
        wechatId: dto.wechatId ?? null,
        domesticReturnAddress: dto.domesticReturnAddress ?? null,
        notes: dto.notes ?? null,
      },
    });
  }

  async findAll(query: {
    q?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.status) {
      if (!VALID_CUSTOMER_STATUSES.includes(query.status)) {
        throw new BadRequestException(
          `Invalid status: ${query.status}. Must be one of: ${VALID_CUSTOMER_STATUSES.join(', ')}`,
        );
      }
      where.status = query.status;
    }
    if (query.q) {
      where.OR = [
        { customerCode: { contains: query.q, mode: 'insensitive' } },
        { phoneNumber: { contains: query.q } },
        { wechatId: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        select: CUSTOMER_LIST_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize: take,
      total,
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        inboundPackages: {
          select: {
            id: true,
            domesticTrackingNo: true,
            status: true,
            warehouseReceivedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        customerShipments: {
          select: {
            id: true,
            shipmentNo: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            inboundPackages: true,
            customerShipments: true,
            transactions: true,
          },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return { data: customer };
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    if (dto.phoneNumber || dto.phoneCountryCode) {
      const newCountry = dto.phoneCountryCode || customer.phoneCountryCode;
      const newPhone = dto.phoneNumber || customer.phoneNumber;
      const conflict = await this.prisma.customer.findFirst({
        where: {
          phoneCountryCode: newCountry,
          phoneNumber: newPhone,
          NOT: { id },
        },
      });
      if (conflict) {
        throw new ConflictException(
          `Another customer already uses phone ${newCountry} ${newPhone}`,
        );
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.phoneCountryCode !== undefined && { phoneCountryCode: dto.phoneCountryCode }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
        ...(dto.wechatId !== undefined && { wechatId: dto.wechatId }),
        ...(dto.domesticReturnAddress !== undefined && { domesticReturnAddress: dto.domesticReturnAddress }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
    return { data: updated };
  }

  async disable(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    if (customer.status === 'DISABLED') {
      return { data: { id, status: 'DISABLED', message: 'Customer is already disabled' } };
    }
    const updated = await this.prisma.customer.update({
      where: { id },
      data: { status: 'DISABLED' },
      select: { id: true, customerCode: true, wechatId: true, status: true, updatedAt: true },
    });
    return { data: updated };
  }

  async hardDelete(id: string, confirm: string) {
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException(
        'Must pass confirm=DELETE_HARD query param to confirm hard delete',
      );
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inboundPackages: true,
            customerShipments: true,
            transactions: true,
          },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const { inboundPackages, customerShipments, transactions } = customer._count;
    if (inboundPackages > 0 || customerShipments > 0 || transactions > 0) {
      throw new ConflictException({
        message: 'Cannot hard delete customer with related records',
        blockers: { inboundPackages, customerShipments, transactions },
      });
    }

    await this.prisma.customer.delete({ where: { id } });
    return { deleted: true, id };
  }

  async generateUniqueCustomerCode(): Promise<string> {
    for (let i = 0; i < MAX_CODE_RETRIES; i++) {
      const digits = String(Math.floor(1000 + Math.random() * 9000));
      const code = `GJ${digits}`;
      const [inCustomers, inRegistrations] = await Promise.all([
        this.prisma.customer.findUnique({ where: { customerCode: code } }),
        this.prisma.customerRegistration.findUnique({ where: { customerCode: code } }),
      ]);
      if (!inCustomers && !inRegistrations) return code;
    }
    throw new BadRequestException(
      'Customer code pool exhausted or collision too high.',
    );
  }
}
