import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderService } from '../order/order.service';
import { InboundPackageDto } from './dto/inbound-package.dto';
import { ConfirmAction } from './dto/confirm-package.dto';
import { OrderStatus, PackageStatus } from '@prisma/client';

@Injectable()
export class PackageService {
  constructor(
    private prisma: PrismaService,
    private orderService: OrderService,
  ) {}

  async inbound(dto: InboundPackageDto, operatorId: string) {
    const volumeWeight = (dto.length * dto.width * dto.height) / 6000;

    return this.prisma.$transaction(async (tx) => {
      let order = await tx.order.findFirst({
        where: { userId: dto.user_id, status: OrderStatus.UNINBOUND },
      });

      if (!order) {
        order = await tx.order.create({
          data: {
            userId: dto.user_id,
            orderNo: `ORD-${Date.now()}`,
          },
        });
      }

      const pkg = await tx.package.create({
        data: {
          orderId: order.id,
          packageNo: `PKG-${Date.now()}`,
          domesticTrackingNo: dto.domestic_tracking_no,
          sourcePlatform: dto.source_platform as any,
          actualWeight: dto.actual_weight,
          lengthCm: dto.length,
          widthCm: dto.width,
          heightCm: dto.height,
          volumeWeight: volumeWeight,
          status: PackageStatus.INBOUNDED,
          inboundAt: new Date(),
          goodsItems: dto.goods_items
            ? { create: dto.goods_items }
            : undefined,
        },
        include: { goodsItems: true },
      });

      await tx.inboundRecord.create({
        data: {
          packageId: pkg.id,
          operatorAdminId: operatorId,
          remark: dto.notes,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.INBOUNDED },
      });

      return pkg;
    });
  }

  async findOne(packageId: string, userId: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      include: {
        images: true,
        goodsItems: true,
        exceptions: true,
        inboundRecords: true,
        order: true,
      },
    });

    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.order.userId !== userId) throw new ForbiddenException();
    return pkg;
  }

  async confirm(
    packageId: string,
    userId: string,
    action: ConfirmAction,
    description?: string,
  ) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      include: { order: true },
    });

    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.order.userId !== userId) throw new ForbiddenException();
    if (pkg.status !== PackageStatus.INBOUNDED) {
      throw new BadRequestException('Package is not awaiting confirmation');
    }

    if (action === ConfirmAction.CONFIRM) {
      return this.prisma.package.update({
        where: { id: packageId },
        data: {
          status: PackageStatus.CONFIRMED,
          userConfirmedAt: new Date(),
        },
      });
    }

    // REPORT_ISSUE: Update status and create exception record
    return this.prisma.$transaction(async (tx) => {
      // Update package status
      await tx.package.update({
        where: { id: packageId },
        data: { status: PackageStatus.EXCEPTION },
      });

      // Create exception record if description provided
      if (description) {
        await tx.exceptionCase.create({
          data: {
            orderId: pkg.order.id,
            packageId: packageId,
            type: 'OTHER',
            status: 'OPEN',
            description,
          },
        });
      }

      return { status: PackageStatus.EXCEPTION };
    });
  }
}
