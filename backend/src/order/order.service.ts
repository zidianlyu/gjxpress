import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { user_id: userId },
      include: {
        packages: {
          include: { images: true },
        },
        shipment: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOneByUser(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: {
        packages: {
          include: {
            images: true,
            goodsItems: true,
            exceptions: true,
            inboundRecord: true,
          },
        },
        shipment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  recalcWeights(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const packages = await tx.package.findMany({
        where: { order_id: orderId },
      });

      const totalActual = packages.reduce(
        (sum, p) => sum + (p.actual_weight ?? 0),
        0,
      );
      const totalVolume = packages.reduce(
        (sum, p) => sum + (p.volume_weight ?? 0),
        0,
      );
      const chargeable = Math.max(totalActual, totalVolume);

      return tx.order.update({
        where: { id: orderId },
        data: {
          total_actual_weight: totalActual,
          total_volume_weight: totalVolume,
          chargeable_weight: chargeable,
        },
      });
    });
  }
}
