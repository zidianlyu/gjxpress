import { PrismaClient, OrderStatus, PackageStatus, PaymentStatus, ImageType, SourcePlatform, ShipmentStatus } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('开始生成测试数据...');

  // 1. 创建测试用户
  const testUser = await prisma.user.upsert({
    where: { openid: 'test_openid_12345' },
    update: {},
    create: {
      openid: 'test_openid_12345',
      userCode: '8888',
      nickname: '测试用户',
      avatarUrl: 'https://via.placeholder.com/100x100/1890ff/ffffff?text=Test',
    },
  });
  console.log('✓ 创建测试用户:', testUser.userCode);

  // 2. 创建管理员 (Admin model)
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      displayName: '管理员',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✓ 创建管理员');

  // Mock 图片 URLs
  const mockImages = {
    outer: 'https://via.placeholder.com/400x300/f0f0f0/666?text=外包装',
    label: 'https://via.placeholder.com/400x300/e6f7ff/1890ff?text=面单',
    inner: 'https://via.placeholder.com/400x300/f6ffed/52c41a?text=内物',
  };

  // 3. 创建订单 1: 待用户确认
  const order1 = await prisma.order.create({
    data: {
      orderNo: `ORD-${Date.now()}-001`,
      userId: testUser.id,
      status: OrderStatus.USER_CONFIRM_PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const pkg1 = await prisma.package.create({
    data: {
      packageNo: `PKG-${Date.now()}-001`,
      orderId: order1.id,
      domesticTrackingNo: 'SF1234567890',
      sourcePlatform: SourcePlatform.TAOBAO,
      status: PackageStatus.INBOUNDED,
      actualWeight: 2.5,
      lengthCm: 30,
      widthCm: 25,
      heightCm: 15,
      volumeWeight: (30 * 25 * 15) / 6000,
      inboundAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [
          { name: '运动鞋', quantity: 1 },
          { name: '袜子', quantity: 3 },
        ],
      },
      images: {
        create: [
          { imageType: ImageType.OUTER, bucket: 'package-images', storagePath: mockImages.outer, publicUrl: mockImages.outer, status: 'UPLOADED' },
          { imageType: ImageType.LABEL, bucket: 'package-images', storagePath: mockImages.label, publicUrl: mockImages.label, status: 'UPLOADED' },
          { imageType: ImageType.INNER, bucket: 'package-images', storagePath: mockImages.inner, publicUrl: mockImages.inner, status: 'UPLOADED' },
        ],
      },
    },
  });

  await prisma.inboundRecord.create({
    data: {
      packageId: pkg1.id,
      operatorAdminId: admin.id,
      remark: '包裹完好，已拍照入库',
    },
  });

  await prisma.order.update({
    where: { id: order1.id },
    data: {
      totalActualWeight: 2.5,
      totalVolumeWeight: (30 * 25 * 15) / 6000,
      chargeableWeight: Math.max(2.5, (30 * 25 * 15) / 6000),
    },
  });

  console.log('✓ 创建订单 1: 待用户确认 (订单ID:', order1.id.slice(0, 8) + ')');

  // 4. 创建订单 2: 待支付
  const order2 = await prisma.order.create({
    data: {
      orderNo: `ORD-${Date.now()}-002`,
      userId: testUser.id,
      status: OrderStatus.PAYMENT_PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      totalActualWeight: 5.2,
      totalVolumeWeight: 4.8,
      chargeableWeight: 5.2,
      estimatedPrice: 156,
    },
  });

  await prisma.package.create({
    data: {
      packageNo: `PKG-${Date.now()}-002`,
      orderId: order2.id,
      domesticTrackingNo: 'YT9876543210',
      sourcePlatform: SourcePlatform.JD,
      status: PackageStatus.CONFIRMED,
      actualWeight: 3.0,
      lengthCm: 35,
      widthCm: 30,
      heightCm: 20,
      volumeWeight: (35 * 30 * 20) / 6000,
      inboundAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      userConfirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [{ name: '电动牙刷', quantity: 1 }],
      },
      images: {
        create: [
          { imageType: ImageType.OUTER, bucket: 'package-images', storagePath: mockImages.outer, publicUrl: mockImages.outer, status: 'UPLOADED' },
          { imageType: ImageType.INNER, bucket: 'package-images', storagePath: mockImages.inner, publicUrl: mockImages.inner, status: 'UPLOADED' },
        ],
      },
    },
  });

  await prisma.package.create({
    data: {
      packageNo: `PKG-${Date.now()}-003`,
      orderId: order2.id,
      domesticTrackingNo: 'SF1122334455',
      sourcePlatform: SourcePlatform.PINDUODUO,
      status: PackageStatus.CONFIRMED,
      actualWeight: 2.2,
      lengthCm: 25,
      widthCm: 20,
      heightCm: 12,
      volumeWeight: (25 * 20 * 12) / 6000,
      inboundAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      userConfirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [{ name: '手机壳', quantity: 2 }],
      },
      images: {
        create: [
          { imageType: ImageType.OUTER, bucket: 'package-images', storagePath: mockImages.outer, publicUrl: mockImages.outer, status: 'UPLOADED' },
          { imageType: ImageType.LABEL, bucket: 'package-images', storagePath: mockImages.label, publicUrl: mockImages.label, status: 'UPLOADED' },
        ],
      },
    },
  });

  console.log('✓ 创建订单 2: 待支付 (订单ID:', order2.id.slice(0, 8) + ')');

  // 5. 创建订单 3: 已发货
  const order3 = await prisma.order.create({
    data: {
      orderNo: `ORD-${Date.now()}-003`,
      userId: testUser.id,
      status: OrderStatus.SHIPPED,
      paymentStatus: PaymentStatus.PAID,
      totalActualWeight: 1.8,
      totalVolumeWeight: 1.5,
      chargeableWeight: 1.8,
      estimatedPrice: 89,
      finalPrice: 89,
    },
  });

  await prisma.package.create({
    data: {
      packageNo: `PKG-${Date.now()}-004`,
      orderId: order3.id,
      domesticTrackingNo: 'JD5555666677',
      sourcePlatform: SourcePlatform.OTHER,
      status: PackageStatus.CONFIRMED,
      actualWeight: 1.8,
      lengthCm: 22,
      widthCm: 18,
      heightCm: 10,
      volumeWeight: (22 * 18 * 10) / 6000,
      inboundAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      userConfirmedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [{ name: '耳机', quantity: 1 }],
      },
      images: {
        create: [
          { imageType: ImageType.OUTER, bucket: 'package-images', storagePath: mockImages.outer, publicUrl: mockImages.outer, status: 'UPLOADED' },
          { imageType: ImageType.INNER, bucket: 'package-images', storagePath: mockImages.inner, publicUrl: mockImages.inner, status: 'UPLOADED' },
        ],
      },
    },
  });

  await prisma.shipment.create({
    data: {
      orderId: order3.id,
      provider: 'DHL',
      trackingNumber: 'DHL7890123456',
      shippedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: ShipmentStatus.IN_TRANSIT,
      createdByAdminId: admin.id,
    },
  });

  await prisma.adminActionLog.create({
    data: {
      adminId: admin.id,
      targetType: 'SHIPMENT',
      targetId: order3.id,
      action: 'CREATE_SHIPMENT',
      afterState: { provider: 'DHL', trackingNumber: 'DHL7890123456' },
    },
  });

  console.log('✓ 创建订单 3: 已发货 (订单ID:', order3.id.slice(0, 8) + ')');

  // 6. 创建订单 4: 有异常的包裹
  const order4 = await prisma.order.create({
    data: {
      orderNo: `ORD-${Date.now()}-004`,
      userId: testUser.id,
      status: OrderStatus.USER_CONFIRM_PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const pkg4 = await prisma.package.create({
    data: {
      packageNo: `PKG-${Date.now()}-005`,
      orderId: order4.id,
      domesticTrackingNo: 'SF9999888877',
      sourcePlatform: SourcePlatform.TAOBAO,
      status: PackageStatus.INBOUNDED,
      actualWeight: 3.5,
      lengthCm: 40,
      widthCm: 35,
      heightCm: 20,
      volumeWeight: (40 * 35 * 20) / 6000,
      inboundAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [{ name: '衣服', quantity: 2 }],
      },
      images: {
        create: [
          { imageType: ImageType.OUTER, bucket: 'package-images', storagePath: mockImages.outer, publicUrl: mockImages.outer, status: 'UPLOADED' },
          { imageType: ImageType.LABEL, bucket: 'package-images', storagePath: mockImages.label, publicUrl: mockImages.label, status: 'UPLOADED' },
        ],
      },
    },
  });

  await prisma.exceptionCase.create({
    data: {
      orderId: order4.id,
      packageId: pkg4.id,
      type: 'WRONG_ITEM',
      status: 'OPEN',
      description: '收到的商品与描述不符',
    },
  });

  await prisma.order.update({
    where: { id: order4.id },
    data: {
      totalActualWeight: 3.5,
      totalVolumeWeight: (40 * 35 * 20) / 6000,
      chargeableWeight: Math.max(3.5, (40 * 35 * 20) / 6000),
    },
  });

  console.log('✓ 创建订单 4: 有异常待处理 (订单ID:', order4.id.slice(0, 8) + ')');

  // 7. 创建 AdminActionLog 示例
  await prisma.adminActionLog.create({
    data: {
      adminId: admin.id,
      targetType: 'ORDER',
      targetId: order1.id,
      action: 'UPDATE_STATUS',
      beforeState: { status: 'UNINBOUND' },
      afterState: { status: 'USER_CONFIRM_PENDING' },
    },
  });

  console.log('✓ 创建 Admin 操作日志');

  console.log('\n=== 测试数据生成完成 ===');
  console.log('测试用户:', testUser.userCode);
  console.log('管理员: admin / admin123');
  console.log('- 待确认订单:', 1);
  console.log('- 待支付订单:', 1);
  console.log('- 已发货订单:', 1);
  console.log('- 有异常订单:', 1);
  console.log('总计包裹:', 5);
}

main()
  .catch((e) => {
    console.error('Seed 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
