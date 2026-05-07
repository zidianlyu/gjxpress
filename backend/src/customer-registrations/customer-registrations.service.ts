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

const REGISTRATION_RESPONSE_SELECT = {
  id: true,
  customerCode: true,
  phoneCountryCode: true,
  phoneNumber: true,
  wechatId: true,
  domesticReturnAddress: true,
  createdAt: true,
  updatedAt: true,
} as const;

const CUSTOMER_RESPONSE_SELECT = {
  id: true,
  customerCode: true,
  phoneCountryCode: true,
  phoneNumber: true,
  wechatId: true,
  domesticReturnAddress: true,
  createdAt: true,
  updatedAt: true,
} as const;

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

    const existingRegistration = await this.prisma.customerRegistration.findFirst({
      where: { phoneCountryCode: countryCode, phoneNumber },
    });
    if (existingRegistration) {
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
        ipHash: meta?.ipHash ?? null,
        userAgent: meta?.userAgent ?? null,
      },
    });

    return {
      id: registration.id,
      customerCode: registration.customerCode,
      message: '注册信息已提交，请等待工作人员审核。',
    };
  }

  async adminCreate(dto: CreateCustomerRegistrationDto) {
    const countryCode = (dto.phoneCountryCode || '+86').trim();
    const phoneNumber = dto.phoneNumber.trim();

    const existingRegistration = await this.prisma.customerRegistration.findFirst({
      where: { phoneCountryCode: countryCode, phoneNumber },
    });
    if (existingRegistration) {
      throw new ConflictException('该手机号已有待审核申请。');
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
      },
      select: REGISTRATION_RESPONSE_SELECT,
    });

    return { data: registration };
  }

  async findAll(query: {
    q?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.q) {
      where.OR = [
        { customerCode: { contains: query.q, mode: 'insensitive' } },
        { phoneNumber: { contains: query.q } },
        { wechatId: { contains: query.q, mode: 'insensitive' } },
        { domesticReturnAddress: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customerRegistration.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: REGISTRATION_RESPONSE_SELECT,
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
      select: REGISTRATION_RESPONSE_SELECT,
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
      },
      select: REGISTRATION_RESPONSE_SELECT,
    });
    return { data: updated };
  }

  async approve(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.customerRegistration.findUnique({ where: { id } });
      if (!reg) throw new NotFoundException('Registration not found');

      const codeConflict = await tx.customer.findUnique({
        where: { customerCode: reg.customerCode },
      });
      if (codeConflict) {
        throw new ConflictException(
          `Customer already exists for customerCode ${reg.customerCode}`,
        );
      }

      const phoneConflict = await tx.customer.findFirst({
        where: { phoneCountryCode: reg.phoneCountryCode, phoneNumber: reg.phoneNumber },
      });
      if (phoneConflict) {
        throw new ConflictException(
          `Phone ${reg.phoneCountryCode} ${reg.phoneNumber} is already registered as a customer`,
        );
      }

      const customer = await tx.customer.create({
        data: {
          customerCode: reg.customerCode,
          phoneCountryCode: reg.phoneCountryCode,
          phoneNumber: reg.phoneNumber,
          wechatId: reg.wechatId,
          domesticReturnAddress: reg.domesticReturnAddress,
        },
        select: CUSTOMER_RESPONSE_SELECT,
      });

      await tx.customerRegistration.delete({ where: { id: reg.id } });

      return {
        approved: true,
        deletedRegistrationId: reg.id,
        customer,
      };
    });
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
