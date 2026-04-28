import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminLogService {
  constructor(private prisma: PrismaService) {}

  async listLogs(orderId?: string) {
    return this.prisma.adminLog.findMany({
      where: orderId ? { order_id: orderId } : undefined,
      include: { admin: { select: { nickname: true, user_code: true } } },
      orderBy: { created_at: 'desc' },
    });
  }
}
