import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update payment status for an order
   *
   * Always creates admin log for audit trail
   */
  async updateStatus(orderId: string, dto: UpdatePaymentDto, adminId: string) {
    // 1. Get current order state
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const previousStatus = order.paymentStatus;

    // 2. Update order payment status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: dto.status,
        finalPrice: dto.final_price ?? undefined,
        manualOverride: dto.manual_override ?? false,
        // If paid, update order status to READY_TO_SHIP
        status:
          dto.status === PaymentStatus.PAID && order.status === OrderStatus.PAYMENT_PENDING
            ? OrderStatus.READY_TO_SHIP
            : undefined,
      },
    });

    // 3. Always log admin action
    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        targetType: 'PAYMENT',
        targetId: orderId,
        action: dto.manual_override ? 'OVERRIDE_PAYMENT' : 'UPDATE_PAYMENT_STATUS',
        beforeState: {
          paymentStatus: previousStatus,
          orderStatus: order.status,
        },
        afterState: {
          paymentStatus: dto.status,
          orderStatus: updatedOrder.status,
        },
      },
    });

    return updatedOrder;
  }

  /**
   * Get payment status history (via admin logs)
   */
  async getPaymentHistory(orderId: string) {
    return this.prisma.adminActionLog.findMany({
      where: {
        targetType: 'PAYMENT',
        targetId: orderId,
      },
      include: {
        admin: {
          select: {
            displayName: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
