import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderStatus, AdminAction } from '@prisma/client';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: string, dto: CreateShipmentDto, adminId: string) {
    const shipment = await this.prisma.shipment.create({
      data: { order_id: orderId, ...dto, shipped_at: new Date() },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
    });

    await this.prisma.adminLog.create({
      data: {
        admin_id: adminId,
        order_id: orderId,
        action: AdminAction.OVERRIDE_SHIP,
        details: dto as any,
      },
    });

    return shipment;
  }

  async findByOrder(orderId: string) {
    return this.prisma.shipment.findUnique({
      where: { order_id: orderId },
    });
  }
}
