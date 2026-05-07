import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInboundPackageDto } from './dto/create-inbound-package.dto';
import { INBOUND_PACKAGE_STATUS_LABELS } from '../common/status-labels';
import { AdminImageService } from '../admin-image/admin-image.service';

const VALID_INBOUND_PACKAGE_STATUSES = ['UNIDENTIFIED', 'ARRIVED', 'CONSOLIDATED'];
const CUSTOMER_CODE_PATTERN = /^GJ\d{4}$/;

function normalizeOptionalString(value?: string | null): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function assertInboundPackageStatus(status: string) {
  if (!VALID_INBOUND_PACKAGE_STATUSES.includes(status)) {
    throw new BadRequestException(
      `Invalid status: ${status}. Must be one of: ${VALID_INBOUND_PACKAGE_STATUSES.join(', ')}`,
    );
  }
}

function normalizeCustomerCode(value?: string | null): string | null | undefined {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return normalized;
  const upper = normalized.toUpperCase();
  if (!CUSTOMER_CODE_PATTERN.test(upper)) {
    throw new BadRequestException('customerCode must match /^GJ\\d{4}$/');
  }
  return upper;
}

function formatInboundPackage(pkg: any) {
  return {
    id: pkg.id,
    domesticTrackingNo: pkg.domesticTrackingNo,
    status: pkg.status,
    statusText: INBOUND_PACKAGE_STATUS_LABELS[pkg.status] ?? pkg.status,
    customer: pkg.customer
      ? {
          id: pkg.customer.id,
          customerCode: pkg.customer.customerCode,
          status: pkg.customer.status,
          phoneCountryCode: pkg.customer.phoneCountryCode,
          phoneNumber: pkg.customer.phoneNumber,
          wechatId: pkg.customer.wechatId,
        }
      : null,
    customerId: pkg.customerId,
    warehouseReceivedAt: pkg.warehouseReceivedAt,
    adminNote: pkg.adminNote,
    issueNote: pkg.issueNote,
    imageUrls: pkg.imageUrls ?? [],
    inShipment: pkg.inShipment ?? pkg._count?.shipmentItems > 0,
    ...(pkg.shipmentItems !== undefined && { shipmentItems: pkg.shipmentItems }),
    createdAt: pkg.createdAt,
    updatedAt: pkg.updatedAt,
  };
}

@Injectable()
export class InboundPackagesService {
  constructor(
    private prisma: PrismaService,
    private imageService: AdminImageService,
  ) {}

  async create(dto: CreateInboundPackageDto) {
    const domesticTrackingNo = normalizeOptionalString(dto.domesticTrackingNo);
    const customerCode = normalizeOptionalString(dto.customerCode);

    if (domesticTrackingNo) {
      const existing = await this.prisma.inboundPackage.findUnique({
        where: { domesticTrackingNo },
      });
      if (existing) {
        throw new ConflictException(
          `InboundPackage with domesticTrackingNo ${domesticTrackingNo} already exists`,
        );
      }
    }

    let customerId: string | null = null;
    let status: any = 'UNIDENTIFIED';

    if (customerCode) {
      const customer = await this.prisma.customer.findUnique({
        where: { customerCode },
      });
      if (!customer) {
        throw new NotFoundException(
          `Customer with code ${customerCode} not found. Correct the customerCode or omit it to create as UNIDENTIFIED.`,
        );
      }
      customerId = customer.id;
      status = 'ARRIVED';
    }

    const created = await this.prisma.inboundPackage.create({
      data: {
        domesticTrackingNo,
        customerId,
        status,
        warehouseReceivedAt: dto.warehouseReceivedAt
          ? new Date(dto.warehouseReceivedAt)
          : new Date(),
        adminNote: normalizeOptionalString(dto.adminNote),
      },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            status: true,
            phoneCountryCode: true,
            phoneNumber: true,
            wechatId: true,
          },
        },
      },
    });
    return { data: formatInboundPackage(created) };
  }

  async findAll(query: {
    q?: string;
    status?: string;
    customerId?: string;
    customerCode?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.status) {
      assertInboundPackageStatus(query.status);
      where.status = query.status;
    }
    if (query.customerId) where.customerId = query.customerId;
    if (query.customerCode) {
      where.customer = {
        ...(where.customer ?? {}),
        customerCode: { equals: query.customerCode, mode: 'insensitive' },
      };
    }
    if (query.q) {
      where.OR = [
        { domesticTrackingNo: { contains: query.q, mode: 'insensitive' } },
        {
          customer: {
            customerCode: { contains: query.q, mode: 'insensitive' },
          },
        },
        {
          customer: {
            phoneNumber: { contains: query.q },
          },
        },
        {
          customer: {
            wechatId: { contains: query.q, mode: 'insensitive' },
          },
        },
      ];
    }

    const [packages, total] = await Promise.all([
      this.prisma.inboundPackage.findMany({
        where,
        skip,
        take,
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              status: true,
              phoneCountryCode: true,
              phoneNumber: true,
              wechatId: true,
            },
          },
          _count: { select: { shipmentItems: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inboundPackage.count({ where }),
    ]);

    return {
      items: packages.map((p) => formatInboundPackage(p)),
      page,
      pageSize: take,
      total,
    };
  }

  async findOne(id: string) {
    const pkg = await this.prisma.inboundPackage.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            status: true,
            wechatId: true,
            phoneCountryCode: true,
            phoneNumber: true,
          },
        },
        shipmentItems: {
          include: {
            customerShipment: {
              select: { id: true, shipmentNo: true, status: true },
            },
          },
        },
      },
    });
    if (!pkg) throw new NotFoundException('InboundPackage not found');
    return { data: formatInboundPackage(pkg) };
  }

  async update(
    id: string,
    dto: {
      domesticTrackingNo?: string;
      customerCode?: string | null;
      warehouseReceivedAt?: string;
      issueNote?: string;
      adminNote?: string;
      status?: string;
    },
  ) {
    const pkg = await this.prisma.inboundPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    const domesticTrackingNo = normalizeOptionalString(dto.domesticTrackingNo);
    const customerCode = normalizeCustomerCode(dto.customerCode);

    if (domesticTrackingNo && domesticTrackingNo !== pkg.domesticTrackingNo) {
      const conflict = await this.prisma.inboundPackage.findFirst({
        where: { domesticTrackingNo, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(
          `domesticTrackingNo ${domesticTrackingNo} is already used by another package`,
        );
      }
    }

    if (dto.status) {
      assertInboundPackageStatus(dto.status);
    }

    let customerIdUpdate: string | null | undefined;
    if (dto.customerCode !== undefined) {
      if (customerCode === null) {
        customerIdUpdate = null;
      } else {
        const customer = await this.prisma.customer.findUnique({
          where: { customerCode },
          select: { id: true },
        });
        if (!customer) throw new NotFoundException(`Customer with code ${customerCode} not found`);
        customerIdUpdate = customer.id;
      }
    }

    const updated = await this.prisma.inboundPackage.update({
      where: { id },
      data: {
        ...(dto.domesticTrackingNo !== undefined && { domesticTrackingNo }),
        ...(customerIdUpdate !== undefined && { customerId: customerIdUpdate }),
        ...(dto.warehouseReceivedAt !== undefined && { warehouseReceivedAt: new Date(dto.warehouseReceivedAt) }),
        ...(dto.issueNote !== undefined && { issueNote: normalizeOptionalString(dto.issueNote) }),
        ...(dto.adminNote !== undefined && { adminNote: normalizeOptionalString(dto.adminNote) }),
        ...(dto.status !== undefined
          ? { status: dto.status as any }
          : customerIdUpdate === null
            ? { status: 'UNIDENTIFIED' as any }
            : customerIdUpdate
              ? { status: pkg.status === 'UNIDENTIFIED' ? 'ARRIVED' as any : pkg.status }
              : {}),
      },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            status: true,
            phoneCountryCode: true,
            phoneNumber: true,
            wechatId: true,
          },
        },
      },
    });
    return { data: formatInboundPackage(updated) };
  }

  async assignCustomer(id: string, customerCode: string) {
    const pkg = await this.prisma.inboundPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    if (pkg.customerId) {
      throw new ConflictException(
        'This package is already assigned to a customer. Use force reassignment if needed.',
      );
    }

    const customer = await this.prisma.customer.findUnique({
      where: { customerCode },
    });
    if (!customer) throw new NotFoundException(`Customer with code ${customerCode} not found`);

    const updated = await this.prisma.inboundPackage.update({
      where: { id },
      data: {
        customerId: customer.id,
        status: pkg.status === 'UNIDENTIFIED' ? 'ARRIVED' : pkg.status,
      },
      include: {
        customer: {
          select: {
            id: true,
            customerCode: true,
            status: true,
            phoneCountryCode: true,
            phoneNumber: true,
            wechatId: true,
          },
        },
      },
    });
    return { data: formatInboundPackage(updated) };
  }

  async updateStatus(id: string, status: string) {
    const pkg = await this.prisma.inboundPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    assertInboundPackageStatus(status);

    const updated = await this.prisma.inboundPackage.update({
      where: { id },
      data: { status: status as any },
    });
    return {
      data: {
        id: updated.id,
        status: updated.status,
        statusText: INBOUND_PACKAGE_STATUS_LABELS[updated.status],
        updatedAt: updated.updatedAt,
      },
    };
  }

  async getImages(id: string) {
    const pkg = await this.prisma.inboundPackage.findUnique({
      where: { id },
      select: { id: true, imageUrls: true },
    });
    if (!pkg) throw new NotFoundException('InboundPackage not found');
    return { items: pkg.imageUrls };
  }

  async addImage(id: string, imageUrl: string) {
    const pkg = await this.prisma.inboundPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    const updated = await this.prisma.inboundPackage.update({
      where: { id },
      data: { imageUrls: { push: imageUrl } },
    });
    return { url: imageUrl, imageUrls: updated.imageUrls };
  }

  async removeImage(id: string, imageUrl: string, confirm: string) {
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException('Must pass confirm=DELETE_HARD to confirm image deletion');
    }

    const pkg = await this.prisma.inboundPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    if (!pkg.imageUrls.includes(imageUrl)) {
      throw new BadRequestException('imageUrl not found in this package');
    }

    const updated = await this.prisma.inboundPackage.update({
      where: { id },
      data: { imageUrls: pkg.imageUrls.filter((u) => u !== imageUrl) },
    });
    return { deleted: true, url: imageUrl, imageUrls: updated.imageUrls };
  }

  async hardDelete(id: string, confirm: string) {
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException(
        'Must pass confirm=DELETE_HARD query param to confirm hard delete',
      );
    }

    const pkg = await this.prisma.inboundPackage.findUnique({
      where: { id },
      include: { _count: { select: { shipmentItems: true } } },
    });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    if (pkg._count.shipmentItems > 0) {
      throw new ConflictException({
        message: 'Cannot hard delete inbound package that is linked to a customer shipment',
        blockers: { shipmentItems: pkg._count.shipmentItems },
      });
    }

    const deletedImageCount = await this.imageService.removeByPublicUrls(pkg.imageUrls);

    await this.prisma.inboundPackage.delete({ where: { id } });
    return { deleted: true, id, deletedImageCount };
  }
}
