import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, type: string, title?: string, body?: string) {
    return this.prisma.notification.create({
      data: { userId, type, title, body },
    });
  }

  async markAsSent(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { sentAt: new Date() },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async listByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
