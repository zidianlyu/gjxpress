import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) {}

  async generate(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Order does not belong to user');

    const token = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const qrCode = await this.prisma.qrCode.create({
      data: {
        orderId,
        tokenHash,
        purpose: 'RECEIPT_CONFIRMATION',
        expiresAt,
      },
    });

    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({ token, orderId }),
    );

    return { qr_code: qrCode, qr_data_url: qrDataUrl };
  }

  async scan(token: string, scannerUserId: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const qrCode = await this.prisma.qrCode.findFirst({
      where: { tokenHash },
      include: { order: true },
    });

    if (!qrCode) throw new NotFoundException('Invalid QR code');
    if (qrCode.isUsed) throw new BadRequestException('QR code already used');
    if (qrCode.expiresAt < new Date()) throw new BadRequestException('QR code expired');
    if (qrCode.order.userId !== scannerUserId) throw new BadRequestException('QR code does not belong to you');

    // Log the scan
    await this.prisma.qrScanLog.create({
      data: {
        qrCodeId: qrCode.id,
        scanUserId: scannerUserId,
        isAuthorized: true,
        result: 'CONFIRMED',
      },
    });

    // Mark QR as used
    await this.prisma.qrCode.update({
      where: { id: qrCode.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: qrCode.orderId },
      data: { status: OrderStatus.COMPLETED },
    });

    return { success: true, orderId: qrCode.orderId };
  }
}
