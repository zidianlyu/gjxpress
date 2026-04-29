import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderStatus, PaymentStatus, AdminAction } from '@prisma/client';

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

    const isPaid = order.payment_status === PaymentStatus.PAID;
    const isAllowedStatus = allowedStatuses.includes(order.status);

    if (!isAllowedStatus && !isPaid && !forceOverride) {
      throw new BadRequestException(
        `Cannot ship order: Payment status is ${order.payment_status}. ` +
          `Order must be paid or admin override (force=true) is required.`,
      );
    }

    // 3. Create shipment
    const shipment = await this.prisma.shipment.create({
      data: {
        order_id: orderId,
        provider: dto.provider,
        tracking_number: dto.tracking_number,
        shipped_at: new Date(),
        estimated_arrival: dto.estimated_arrival
          ? new Date(dto.estimated_arrival)
          : null,
      },
    });

    // 4. Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SHIPPED },
    });

    // 5. Log admin action
    await this.prisma.adminLog.create({
      data: {
        admin_id: adminId,
        order_id: orderId,
        action: forceOverride ? AdminAction.OVERRIDE_SHIP : AdminAction.OVERRIDE_STATUS,
        details: {
          ...dto,
          force_override: forceOverride,
          previous_payment_status: order.payment_status,
          previous_order_status: order.status,
        },
      },
    });

    return shipment;
  }

  async findByOrder(orderId: string) {
    return this.prisma.shipment.findUnique({
      where: { order_id: orderId },
    });
  }

  /**
   * Get shipment details with order info
   */
  async findByOrderWithDetails(orderId: string) {
    return this.prisma.shipment.findUnique({
      where: { order_id: orderId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            payment_status: true,
            user_id: true,
          },
        },
      },
    });
  }
}
