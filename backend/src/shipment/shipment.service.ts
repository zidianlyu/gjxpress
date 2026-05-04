import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create shipment for an order
   *
   * Status flow protection:
   * - Order must be in PAID or READY_TO_SHIP status
   * - If order is not paid, admin override is required
   * - Creates admin log for all shipments
   */
  async create(
    orderId: string,
    dto: CreateShipmentDto,
    adminId: string,
    forceOverride: boolean = false,
  ) {
    // 1. Get order with payment status
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { shipment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.shipment) {
      throw new BadRequestException('Order already has a shipment');
    }

    // 2. Status flow validation
    const allowedStatuses: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.READY_TO_SHIP,
      OrderStatus.COMPLETED,
    ];

    const isPaid = order.paymentStatus === PaymentStatus.PAID;
    const isAllowedStatus = allowedStatuses.includes(order.status);

    if (!isAllowedStatus && !isPaid && !forceOverride) {
      throw new BadRequestException(
        `Cannot ship order: Payment status is ${order.paymentStatus}. ` +
          `Order must be paid or admin override (force=true) is required.`,
      );
    }

    // 3. Create shipment
    const shipment = await this.prisma.shipment.create({
      data: {
        orderId,
        provider: dto.provider as any,
        trackingNumber: dto.tracking_number,
        shippedAt: new Date(),
        estimatedArrivalAt: dto.estimated_arrival
          ? new Date(dto.estimated_arrival)
          : null,
        createdByAdminId: adminId,
      },
    });

    // 4. Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
    });

    // 5. Log admin action
    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        targetType: 'SHIPMENT',
        targetId: orderId,
        action: forceOverride ? 'FORCE_SHIP' : 'CREATE_SHIPMENT',
        beforeState: {
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
        },
        afterState: {
          orderStatus: OrderStatus.SHIPPED,
          trackingNumber: dto.tracking_number,
          provider: dto.provider,
        },
      },
    });

    return shipment;
  }

  async findByOrder(orderId: string) {
    return this.prisma.shipment.findUnique({
      where: { orderId },
    });
  }

  /**
   * Get shipment details with order info
   */
  async findByOrderWithDetails(orderId: string) {
    return this.prisma.shipment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            userId: true,
          },
        },
      },
    });
  }
}
