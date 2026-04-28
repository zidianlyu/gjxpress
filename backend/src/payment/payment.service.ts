import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AdminAction } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async updateStatus(orderId: string, dto: UpdatePaymentDto, adminId: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        payment_status: dto.status,
        final_price: dto.final_price ?? undefined,
        manual_override: dto.manual_override ?? false,
      },
    });

    if (dto.manual_override) {
      await this.prisma.adminLog.create({
        data: {
          admin_id: adminId,
          order_id: orderId,
          action: AdminAction.OVERRIDE_PAYMENT,
          details: dto as any,
        },
      });
    }

    return order;
  }
}
