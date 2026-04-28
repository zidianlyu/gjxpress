import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generate(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.user_id !== userId) throw new BadRequestException('Order does not belong to user');

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const qrToken = await this.prisma.qRToken.create({
      data: {
        token,
        order_id: orderId,
        user_id: userId,
        expires_at: expiresAt,
      },
    });

    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({ token, orderId }),
    );

    return { qr_token: qrToken, qr_data_url: qrDataUrl };
  }

  async scan(token: string, scannerUserId: string) {
    const qrToken = await this.prisma.qRToken.findUnique({
      where: { token },
      include: { order: true },
    });

    if (!qrToken) throw new NotFoundException('Invalid QR code');
    if (qrToken.used) throw new BadRequestException('QR code already used');
    if (qrToken.expires_at < new Date()) throw new BadRequestException('QR code expired');
    if (qrToken.user_id !== scannerUserId) throw new BadRequestException('QR code does not belong to you');

    // Mark as completed
    await this.prisma.qRToken.update({
      where: { id: qrToken.id },
      data: { used: true },
    });

    await this.prisma.order.update({
      where: { id: qrToken.order_id },
      data: { status: 'COMPLETED' },
    });

    return { success: true, order_id: qrToken.order_id };
  }
}
