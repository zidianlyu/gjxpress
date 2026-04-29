import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus, AdminAction, OrderStatus } from '@prisma/client';

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

    const previousStatus = order.payment_status;

    // 2. Update order payment status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        payment_status: dto.status,
        final_price: dto.final_price ?? undefined,
        manual_override: dto.manual_override ?? false,
        // If paid, update order status to READY_TO_SHIP
        status:
          dto.status === PaymentStatus.PAID && order.status === OrderStatus.PAYMENT_PENDING
            ? OrderStatus.READY_TO_SHIP
            : undefined,
      },
    });

    // 3. Always log admin action (not just for manual override)
    await this.prisma.adminLog.create({
      data: {
        admin_id: adminId,
        order_id: orderId,
        action: dto.manual_override
          ? AdminAction.OVERRIDE_PAYMENT
          : AdminAction.OVERRIDE_STATUS,
        details: {
          ...dto,
          previous_payment_status: previousStatus,
          new_payment_status: dto.status,
          previous_order_status: order.status,
          new_order_status: updatedOrder.status,
        } as any,
      },
    });

    return updatedOrder;
  }

  /**
   * Get payment status history (via admin logs)
   */
  async getPaymentHistory(orderId: string) {
    return this.prisma.adminLog.findMany({
      where: {
        order_id: orderId,
        action: {
          in: [AdminAction.OVERRIDE_PAYMENT, AdminAction.OVERRIDE_STATUS],
        },
      },
      include: {
        admin: {
          select: {
            nickname: true,
            user_code: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
