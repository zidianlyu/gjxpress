import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationTrigger } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: string, userId: string, trigger: NotificationTrigger) {
    return this.prisma.notification.create({
      data: { order_id: orderId, user_id: userId, trigger },
    });
  }

  async markAsSent(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { sent_at: new Date() },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }
}
