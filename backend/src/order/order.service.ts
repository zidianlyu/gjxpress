import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        packages: {
          include: { images: true },
        },
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByUser(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        packages: {
          include: {
            images: true,
            goodsItems: true,
            exceptions: true,
            inboundRecords: true,
          },
        },
        shipment: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getShipmentByOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        shipment: {
          include: { events: { orderBy: { eventTime: 'desc' } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.shipment) return { data: null };
    return { data: order.shipment };
  }

  recalcWeights(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const packages = await tx.package.findMany({
        where: { orderId },
      });

      const totalActual = packages.reduce(
        (sum, p) => sum + Number(p.actualWeight ?? 0),
        0,
      );
      const totalVolume = packages.reduce(
        (sum, p) => sum + Number(p.volumeWeight ?? 0),
        0,
      );
      const chargeable = Math.max(totalActual, totalVolume);

      return tx.order.update({
        where: { id: orderId },
        data: {
          totalActualWeight: totalActual,
          totalVolumeWeight: totalVolume,
          chargeableWeight: chargeable,
        },
      });
    });
  }
}
