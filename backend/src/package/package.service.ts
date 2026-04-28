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
        where: { user_id: dto.user_id, status: OrderStatus.UNINBOUND },
      });

      if (!order) {
        order = await tx.order.create({
          data: { user_id: dto.user_id },
        });
      }

      const pkg = await tx.package.create({
        data: {
          order_id: order.id,
          domestic_tracking_no: dto.domestic_tracking_no,
          source_platform: dto.source_platform,
          actual_weight: dto.actual_weight,
          length: dto.length,
          width: dto.width,
          height: dto.height,
          volume_weight: volumeWeight,
          status: PackageStatus.INBOUNDED,
          inbound_time: new Date(),
          goodsItems: dto.goods_items
            ? { create: dto.goods_items }
            : undefined,
        },
        include: { goodsItems: true },
      });

      await tx.inboundRecord.create({
        data: {
          package_id: pkg.id,
          operator_id: operatorId,
          notes: dto.notes,
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
        inboundRecord: true,
        order: true,
      },
    });

    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.order.user_id !== userId) throw new ForbiddenException();
    return pkg;
  }

  async confirm(packageId: string, userId: string, action: ConfirmAction) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      include: { order: true },
    });

    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.order.user_id !== userId) throw new ForbiddenException();
    if (pkg.status !== PackageStatus.INBOUNDED) {
      throw new BadRequestException('Package is not awaiting confirmation');
    }

    if (action === ConfirmAction.CONFIRM) {
      return this.prisma.package.update({
        where: { id: packageId },
        data: {
          status: PackageStatus.CONFIRMED,
          user_confirmed_at: new Date(),
        },
      });
    }

    return this.prisma.package.update({
      where: { id: packageId },
      data: { status: PackageStatus.EXCEPTION },
    });
  }
}
