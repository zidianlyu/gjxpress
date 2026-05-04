import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrderStatus,
  PaymentStatus,
  ExceptionStatus,
  QrPurpose,
  RecommendationStatus,
} from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Users ────────────────────────────────────────────────────────────────

  async listUsers(page = 1, pageSize = 20, search?: string) {
    const take = Math.min(pageSize, 100);
    const skip = (page - 1) * take;

    const where = search
      ? {
          OR: [
            { userCode: { contains: search } },
            { nickname: { contains: search, mode: 'insensitive' as const } },
            { id: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          userCode: true,
          nickname: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map((u) => ({ ...u, orderCount: u._count.orders, _count: undefined })),
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  // ─── Orders ───────────────────────────────────────────────────────────────

  async listOrders(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    paymentStatus?: string;
    from?: string;
    to?: string;
  }) {
    const page = query.page || 1;
    const take = Math.min(query.pageSize || 20, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }
    if (query.search) {
      where.OR = [
        { orderNo: { contains: query.search } },
        { user: { userCode: { contains: query.search } } },
        { user: { nickname: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { id: true, userCode: true, nickname: true } },
          _count: { select: { packages: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map((o) => ({ ...o, packageCount: o._count.packages, _count: undefined })),
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getOrderDetail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, userCode: true, nickname: true, openid: true } },
        packages: { include: { images: true, goodsItems: true, exceptions: true } },
        paymentRecords: true,
        shipment: { include: { events: true } },
        exceptions: true,
        statusLogs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const { user, ...rest } = order;
    const openidMasked = user.openid
      ? user.openid.slice(0, 4) + '***' + user.openid.slice(-3)
      : null;

    return { data: { ...rest, user: { ...user, openid: undefined, openidMasked } } };
  }

  async createOrder(body: { userId?: string; userCode?: string; remark?: string }, adminId: string) {
    let userId = body.userId;
    if (!userId && body.userCode) {
      const user = await this.prisma.user.findFirst({ where: { userCode: body.userCode } });
      if (!user) throw new NotFoundException(`User with userCode ${body.userCode} not found`);
      userId = user.id;
    }
    if (!userId) throw new BadRequestException('userId or userCode is required');

    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNo: `ORD-${Date.now()}`,
        adminRemark: body.remark,
      },
    });

    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        targetType: 'ORDER',
        targetId: order.id,
        action: 'CREATE_ORDER',
        afterState: { orderNo: order.orderNo, userId },
      },
    });

    return { data: order };
  }

  async updateOrderStatus(orderId: string, status: string, reason: string | undefined, adminId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const fromStatus = order.status;
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });

    await this.prisma.orderStatusLog.create({
      data: {
        orderId,
        fromStatus: fromStatus,
        toStatus: status as OrderStatus,
        changedByType: 'ADMIN',
        changedById: adminId,
        reason,
      },
    });

    await this.prisma.adminActionLog.create({
      data: {
        adminId,
        targetType: 'ORDER',
        targetId: orderId,
        action: 'UPDATE_STATUS',
        beforeState: { status: fromStatus },
        afterState: { status },
        reason,
      },
    });

    return { data: { id: orderId, fromStatus, toStatus: status, updatedAt: updated.updatedAt } };
  }

  async updatePaymentStatus(
    orderId: string,
    dto: {
      paymentStatus: string;
      amount?: number;
      currency?: string;
      paymentMethod?: string;
      proofImageId?: string;
      reason?: string;
    },
    adminId: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const [updated] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: dto.paymentStatus as PaymentStatus,
          status: dto.paymentStatus === 'PAID' ? OrderStatus.PAID : undefined,
        },
      }),
      this.prisma.paymentRecord.create({
        data: {
          orderId,
          paymentStatus: dto.paymentStatus as PaymentStatus,
          paymentMethod: dto.paymentMethod,
          amount: dto.amount,
          currency: dto.currency || 'USD',
          proofImageId: dto.proofImageId,
          remark: dto.reason,
          confirmedByAdminId: adminId,
          confirmedAt: new Date(),
        },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminId,
          targetType: 'PAYMENT',
          targetId: orderId,
          action: 'UPDATE_PAYMENT_STATUS',
          beforeState: { paymentStatus: order.paymentStatus },
          afterState: { paymentStatus: dto.paymentStatus },
          reason: dto.reason,
        },
      }),
    ]);

    return { data: { id: orderId, paymentStatus: updated.paymentStatus, status: updated.status, confirmedAt: new Date() } };
  }

  // ─── Packages ─────────────────────────────────────────────────────────────

  async inboundPackage(dto: any, adminId: string) {
    let userId = dto.userId;
    if (!userId && dto.userCode) {
      const user = await this.prisma.user.findFirst({ where: { userCode: dto.userCode } });
      if (!user) throw new NotFoundException(`User with userCode ${dto.userCode} not found`);
      userId = user.id;
    }
    if (!userId) throw new BadRequestException('userId or userCode is required');

    const volumeWeight = dto.lengthCm && dto.widthCm && dto.heightCm
      ? (dto.lengthCm * dto.widthCm * dto.heightCm) / 6000
      : null;

    return this.prisma.$transaction(async (tx) => {
      let order = dto.orderId
        ? await tx.order.findUnique({ where: { id: dto.orderId } })
        : await tx.order.findFirst({ where: { userId, status: OrderStatus.UNINBOUND } });

      if (!order) {
        order = await tx.order.create({
          data: { userId, orderNo: `ORD-${Date.now()}` },
        });
      }

      const pkg = await tx.package.create({
        data: {
          orderId: order.id,
          packageNo: `PKG-${Date.now()}`,
          domesticTrackingNo: dto.domesticTrackingNo,
          sourcePlatform: dto.sourcePlatform || 'OTHER',
          actualWeight: dto.actualWeight,
          lengthCm: dto.lengthCm,
          widthCm: dto.widthCm,
          heightCm: dto.heightCm,
          volumeWeight,
          status: 'INBOUNDED',
          inboundAt: new Date(),
          remark: dto.remark,
        },
      });

      await tx.inboundRecord.create({
        data: { packageId: pkg.id, operatorAdminId: adminId, remark: dto.remark },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.INBOUNDED },
      });

      return {
        data: {
          package: { id: pkg.id, packageNo: pkg.packageNo, status: pkg.status, actualWeight: pkg.actualWeight, volumeWeight: pkg.volumeWeight },
          order: { id: order.id, orderNo: order.orderNo, status: OrderStatus.INBOUNDED },
        },
      };
    });
  }

  async updatePackage(packageId: string, dto: any, adminId: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Package not found');

    const volumeWeight = dto.lengthCm && dto.widthCm && dto.heightCm
      ? (dto.lengthCm * dto.widthCm * dto.heightCm) / 6000
      : undefined;

    const updated = await this.prisma.package.update({
      where: { id: packageId },
      data: {
        actualWeight: dto.actualWeight,
        lengthCm: dto.lengthCm,
        widthCm: dto.widthCm,
        heightCm: dto.heightCm,
        volumeWeight,
        remark: dto.remark,
      },
    });

    return { data: { id: updated.id, actualWeight: updated.actualWeight, volumeWeight: updated.volumeWeight, updatedAt: updated.updatedAt } };
  }

  // ─── Exceptions ───────────────────────────────────────────────────────────

  async listExceptions(page = 1, pageSize = 20, status?: string, type?: string) {
    const take = Math.min(pageSize, 100);
    const skip = (page - 1) * take;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [data, total] = await Promise.all([
      this.prisma.exceptionCase.findMany({
        where,
        skip,
        take,
        include: {
          order: { select: { orderNo: true } },
          package: { select: { packageNo: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.exceptionCase.count({ where }),
    ]);

    return {
      data: data.map((e) => ({
        id: e.id,
        type: e.type,
        status: e.status,
        orderNo: e.order?.orderNo,
        packageNo: e.package?.packageNo,
        description: e.description,
        createdAt: e.createdAt,
      })),
      pagination: { page, pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async updateException(exceptionId: string, dto: any, adminId: string) {
    const exc = await this.prisma.exceptionCase.findUnique({ where: { id: exceptionId } });
    if (!exc) throw new NotFoundException('Exception not found');

    const updated = await this.prisma.exceptionCase.update({
      where: { id: exceptionId },
      data: {
        status: dto.status as ExceptionStatus,
        resolution: dto.resolution,
        resolvedAt: dto.status === 'RESOLVED' ? new Date() : undefined,
      },
    });

    if (dto.nextOrderStatus && exc.orderId) {
      await this.prisma.order.update({
        where: { id: exc.orderId },
        data: { status: dto.nextOrderStatus as OrderStatus },
      });
    }

    return { data: { id: updated.id, status: updated.status, resolvedAt: updated.resolvedAt } };
  }

  // ─── Shipments ────────────────────────────────────────────────────────────

  async createShipment(dto: any, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { shipment: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.shipment) throw new BadRequestException('Order already has a shipment');

    const isPaid = order.paymentStatus === PaymentStatus.PAID;
    if (!isPaid && !dto.override) {
      throw new BadRequestException('Order must be paid before shipment unless admin override is used.');
    }

    const shipment = await this.prisma.shipment.create({
      data: {
        orderId: dto.orderId,
        provider: dto.provider,
        trackingNumber: dto.trackingNumber,
        shippedAt: dto.shippedAt ? new Date(dto.shippedAt) : new Date(),
        estimatedArrivalAt: dto.estimatedArrivalAt ? new Date(dto.estimatedArrivalAt) : null,
        status: 'SHIPPED',
        createdByAdminId: adminId,
      },
    });

    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: OrderStatus.SHIPPED },
    });

    return { data: { id: shipment.id, orderId: dto.orderId, provider: dto.provider, trackingNumber: dto.trackingNumber, status: 'SHIPPED', orderStatus: OrderStatus.SHIPPED } };
  }

  // ─── QR ───────────────────────────────────────────────────────────────────

  async generateQr(orderId: string, purpose?: string, expiresInHours = 168) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const qrPurpose = (purpose as QrPurpose) || QrPurpose.RECEIPT_CONFIRMATION;

    const qr = await this.prisma.qrCode.create({
      data: { orderId, tokenHash, purpose: qrPurpose, expiresAt },
    });

    return {
      data: {
        qrCodeId: qr.id,
        token: rawToken,
        payload: `gjxpress://qr/scan?token=${rawToken}`,
        expiresAt,
      },
    };
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  async listNotifications() {
    const data = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { data };
  }

  // ─── Action Logs ──────────────────────────────────────────────────────────

  async listActionLogs(page: any = 1, pageSize: any = 20, targetType?: string, targetId?: string) {
    const take = Math.min(Number(pageSize) || 20, 100);
    const skip = (Number(page) - 1) * take;

    const where: any = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;

    const [data, total] = await Promise.all([
      this.prisma.adminActionLog.findMany({
        where,
        skip,
        take,
        include: { admin: { select: { id: true, displayName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adminActionLog.count({ where }),
    ]);

    return {
      data,
      pagination: { page: Number(page), pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  // ─── Recommendations ──────────────────────────────────────────────────────

  async createRecommendation(dto: any) {
    const rec = await this.prisma.recommendation.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        summary: dto.summary,
        body: dto.body,
        category: dto.category,
        city: dto.city,
        tags: dto.tags || [],
        status: (dto.status as RecommendationStatus) || RecommendationStatus.DRAFT,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
    return { data: rec };
  }
}
