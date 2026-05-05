import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInboundPackageDto } from './dto/create-inbound-package.dto';

@Injectable()
export class InboundPackagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInboundPackageDto) {
    if (dto.domesticTrackingNo) {
      const existing = await this.prisma.inboundPackage.findUnique({
        where: { domesticTrackingNo: dto.domesticTrackingNo },
      });
      if (existing) {
        throw new ConflictException(
          `InboundPackage with domesticTrackingNo ${dto.domesticTrackingNo} already exists`,
        );
      }
    }

    let customerId: string | null = null;
    let status: any = 'UNCLAIMED';

    if (dto.customerCode) {
      const customer = await this.prisma.customer.findUnique({
        where: { customerCode: dto.customerCode },
      });
      if (!customer) {
        throw new NotFoundException(
          `Customer with code ${dto.customerCode} not found. Correct the customerCode or omit it to create as UNCLAIMED.`,
        );
      }
      customerId = customer.id;
      status = 'CLAIMED';
    }

    return this.prisma.inboundPackage.create({
      data: {
        domesticTrackingNo: dto.domesticTrackingNo,
        customerId,
        status,
        warehouseReceivedAt: dto.warehouseReceivedAt
          ? new Date(dto.warehouseReceivedAt)
          : new Date(),
        adminNote: dto.adminNote,
      },
      include: {
        customer: {
          select: { id: true, customerCode: true, wechatId: true },
        },
      },
    });
  }

  async findAll(query: {
    q?: string;
    status?: string;
    customerId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page) || 1;
    const take = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;
    if (query.q) {
      where.OR = [
        { domesticTrackingNo: { contains: query.q, mode: 'insensitive' } },
        {
          customer: {
            customerCode: { contains: query.q, mode: 'insensitive' },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.inboundPackage.findMany({
        where,
        skip,
        take,
        include: {
          customer: {
            select: { id: true, customerCode: true, wechatId: true },
          },
          _count: { select: { shipmentItems: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inboundPackage.count({ where }),
    ]);

    return {
      data: data.map((p) => ({
        ...p,
        inShipment: p._count.shipmentItems > 0,
        _count: undefined,
      })),
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
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
    return { data: pkg };
  }

  async update(
    id: string,
    dto: {
      domesticTrackingNo?: string;
      warehouseReceivedAt?: string;
      issueNote?: string;
      adminNote?: string;
      status?: string;
    },
  ) {
    const pkg = await this.prisma.inboundPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    if (dto.domesticTrackingNo && dto.domesticTrackingNo !== pkg.domesticTrackingNo) {
      const conflict = await this.prisma.inboundPackage.findFirst({
        where: { domesticTrackingNo: dto.domesticTrackingNo, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(
          `domesticTrackingNo ${dto.domesticTrackingNo} is already used by another package`,
        );
      }
    }

    if (dto.status) {
      const validStatuses = [
        'UNCLAIMED', 'CLAIMED', 'PREALERTED_NOT_ARRIVED', 'ARRIVED_WAREHOUSE',
        'PENDING_CONFIRMATION', 'CONFIRMED', 'ISSUE_REPORTED', 'CONSOLIDATED', 'INBOUND_EXCEPTION',
      ];
      if (!validStatuses.includes(dto.status)) {
        throw new BadRequestException(`Invalid status: ${dto.status}`);
      }
    }

    const updated = await this.prisma.inboundPackage.update({
      where: { id },
      data: {
        ...(dto.domesticTrackingNo !== undefined && { domesticTrackingNo: dto.domesticTrackingNo }),
        ...(dto.warehouseReceivedAt !== undefined && { warehouseReceivedAt: new Date(dto.warehouseReceivedAt) }),
        ...(dto.issueNote !== undefined && { issueNote: dto.issueNote }),
        ...(dto.adminNote !== undefined && { adminNote: dto.adminNote }),
        ...(dto.status !== undefined && { status: dto.status as any }),
      },
      include: {
        customer: { select: { id: true, customerCode: true, wechatId: true } },
      },
    });
    return { data: updated };
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
        status: pkg.status === 'INBOUND_EXCEPTION' ? 'INBOUND_EXCEPTION' : 'CLAIMED',
      },
      include: {
        customer: { select: { id: true, customerCode: true, wechatId: true } },
      },
    });
    return { data: updated };
  }

  async updateStatus(id: string, status: string) {
    const pkg = await this.prisma.inboundPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('InboundPackage not found');

    const validStatuses = [
      'UNCLAIMED', 'CLAIMED', 'PREALERTED_NOT_ARRIVED', 'ARRIVED_WAREHOUSE',
      'PENDING_CONFIRMATION', 'CONFIRMED', 'ISSUE_REPORTED', 'CONSOLIDATED', 'INBOUND_EXCEPTION',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const updated = await this.prisma.inboundPackage.update({
      where: { id },
      data: { status: status as any },
    });
    return { data: { id: updated.id, status: updated.status, updatedAt: updated.updatedAt } };
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

    await this.prisma.inboundPackage.delete({ where: { id } });
    return { deleted: true, id };
  }
}
