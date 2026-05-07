import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { CreateCustomerRegistrationDto } from './dto/create-customer-registration.dto';
import { UpdateCustomerRegistrationDto } from './dto/update-customer-registration.dto';

@Injectable()
export class CustomerRegistrationsService {
  constructor(
    private prisma: PrismaService,
    private customersService: CustomersService,
  ) {}

  async createRegistration(
    dto: CreateCustomerRegistrationDto,
    meta?: { ipHash?: string; userAgent?: string },
  ) {
    const countryCode = (dto.phoneCountryCode || '+86').trim();
    const phoneNumber = dto.phoneNumber.trim();

    const pendingOrApproved = await this.prisma.customerRegistration.findFirst({
      where: { phoneCountryCode: countryCode, phoneNumber, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (pendingOrApproved) {
      if (pendingOrApproved.status === 'APPROVED') {
        throw new ConflictException('该手机号已关联正式客户，请联系工作人员。');
      }
      throw new ConflictException('该手机号已有待审核申请，请等待工作人员处理。');
    }

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { phoneCountryCode: countryCode, phoneNumber },
    });
    if (existingCustomer) {
      throw new ConflictException('该手机号已登记为正式客户，请联系工作人员。');
    }

    const customerCode = await this.customersService.generateUniqueCustomerCode();

    const registration = await this.prisma.customerRegistration.create({
      data: {
        customerCode,
        phoneCountryCode: countryCode,
        phoneNumber,
        wechatId: dto.wechatId?.trim() || null,
        domesticReturnAddress: dto.domesticReturnAddress?.trim() || null,
        notes: dto.notes?.trim() || null,
        ipHash: meta?.ipHash ?? null,
        userAgent: meta?.userAgent ?? null,
      },
    });

    return {
      id: registration.id,
      customerCode: registration.customerCode,
      status: registration.status,
      message: '注册信息已提交，请等待工作人员审核。',
    };
  }

  async adminCreate(dto: CreateCustomerRegistrationDto, adminId: string) {
    const countryCode = (dto.phoneCountryCode || '+86').trim();
    const phoneNumber = dto.phoneNumber.trim();

    const pendingOrApproved = await this.prisma.customerRegistration.findFirst({
      where: { phoneCountryCode: countryCode, phoneNumber, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (pendingOrApproved) {
      if (pendingOrApproved.status === 'APPROVED') {
        throw new ConflictException('该手机号已关联正式客户。');
      }
      throw new ConflictException('该手机号已有 PENDING 申请。');
    }

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { phoneCountryCode: countryCode, phoneNumber },
    });
    if (existingCustomer) {
      throw new ConflictException('该手机号已是正式客户。');
    }

    const customerCode = await this.customersService.generateUniqueCustomerCode();

    const registration = await this.prisma.customerRegistration.create({
      data: {
        customerCode,
        phoneCountryCode: countryCode,
        phoneNumber,
        wechatId: dto.wechatId?.trim() || null,
        domesticReturnAddress: dto.domesticReturnAddress?.trim() || null,
        notes: dto.notes?.trim() || null,
      },
    });

    return { data: registration };
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
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { customerCode: { contains: query.q, mode: 'insensitive' } },
        { phoneNumber: { contains: query.q } },
        { wechatId: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customerRegistration.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerCode: true,
          phoneCountryCode: true,
          phoneNumber: true,
          wechatId: true,
          domesticReturnAddress: true,
          notes: true,
          status: true,
          reviewNote: true,
          createdCustomerId: true,
          approvedAt: true,
          rejectedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.customerRegistration.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize: take,
      total,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    const reg = await this.prisma.customerRegistration.findUnique({
      where: { id },
      include: {
        createdCustomer: {
          select: {
            id: true,
            customerCode: true,
            phoneCountryCode: true,
            phoneNumber: true,
            wechatId: true,
            domesticReturnAddress: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!reg) throw new NotFoundException('Registration not found');
    return { data: reg };
  }

  async update(id: string, dto: UpdateCustomerRegistrationDto) {
    const reg = await this.prisma.customerRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Registration not found');

    const updated = await this.prisma.customerRegistration.update({
      where: { id },
      data: {
        ...(dto.phoneCountryCode !== undefined && { phoneCountryCode: dto.phoneCountryCode.trim() }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber.trim() }),
        ...(dto.wechatId !== undefined && { wechatId: dto.wechatId?.trim() || null }),
        ...(dto.domesticReturnAddress !== undefined && { domesticReturnAddress: dto.domesticReturnAddress?.trim() || null }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
        ...(dto.reviewNote !== undefined && { reviewNote: dto.reviewNote?.trim() || null }),
      },
    });
    return { data: updated };
  }

  async approve(id: string, adminId: string, reviewNote?: string) {
    const reg = await this.prisma.customerRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Registration not found');
    if (reg.status === 'APPROVED') {
      throw new ConflictException('Registration is already approved');
    }

    const existingCustomer = await this.prisma.customer.findFirst({
      where: { phoneCountryCode: reg.phoneCountryCode, phoneNumber: reg.phoneNumber },
    });
    if (existingCustomer) {
      throw new ConflictException(
        `Phone ${reg.phoneCountryCode} ${reg.phoneNumber} is already registered as a customer`,
      );
    }

    const codeConflict = await this.prisma.customer.findUnique({
      where: { customerCode: reg.customerCode },
    });
    if (codeConflict) {
      throw new ConflictException(
        `customerCode ${reg.customerCode} is already taken by an existing customer`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          customerCode: reg.customerCode,
          phoneCountryCode: reg.phoneCountryCode,
          phoneNumber: reg.phoneNumber,
          wechatId: reg.wechatId,
          domesticReturnAddress: reg.domesticReturnAddress,
          notes: reg.notes,
          status: 'ACTIVE',
        },
      });

      const updatedReg = await tx.customerRegistration.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedByAdminId: adminId,
          createdCustomerId: customer.id,
          ...(reviewNote !== undefined && { reviewNote: reviewNote?.trim() || null }),
        },
        include: {
          createdCustomer: {
            select: {
              id: true,
              customerCode: true,
              phoneCountryCode: true,
              phoneNumber: true,
              wechatId: true,
              domesticReturnAddress: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return {
        registration: updatedReg,
        customer: { id: customer.id, customerCode: customer.customerCode },
      };
    });
  }

  async reject(id: string, adminId: string, reviewNote?: string) {
    const reg = await this.prisma.customerRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Registration not found');
    if (reg.status === 'APPROVED') {
      throw new ConflictException('Cannot reject an already approved registration');
    }

    const updated = await this.prisma.customerRegistration.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedByAdminId: adminId,
        ...(reviewNote !== undefined && { reviewNote: reviewNote?.trim() || null }),
      },
    });
    return { data: updated };
  }

  async hardDelete(id: string, confirm: string) {
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException('Must pass confirm=DELETE_HARD to confirm hard delete');
    }

    const reg = await this.prisma.customerRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Registration not found');

    await this.prisma.customerRegistration.delete({ where: { id } });
    return { deleted: true, id };
  }
}
