import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminLogService {
  constructor(private prisma: PrismaService) {}

  async listLogs(orderId?: string) {
    return this.prisma.adminActionLog.findMany({
      where: orderId ? { targetId: orderId } : undefined,
      include: { admin: { select: { displayName: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
