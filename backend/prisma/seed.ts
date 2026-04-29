import { PrismaClient, OrderStatus, PackageStatus, PaymentStatus, ImageType, AdminAction } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始生成测试数据...');

  // 1. 创建测试用户
  const testUser = await prisma.user.upsert({
    where: { openid: 'test_openid_12345' },
    update: {},
    create: {
      openid: 'test_openid_12345',
      user_code: '8888',
      nickname: '测试用户',
      avatar: 'https://via.placeholder.com/100x100/1890ff/ffffff?text=Test',
    },
  });
  console.log('✓ 创建测试用户:', testUser.user_code);

  // 2. 创建管理员用户 (用于操作日志)
  const adminUser = await prisma.user.upsert({
    where: { openid: 'admin_openid_12345' },
    update: {},
    create: {
      openid: 'admin_openid_12345',
      user_code: '0000',
      nickname: '管理员',
      avatar: 'https://via.placeholder.com/100x100/52c41a/ffffff?text=Admin',
      is_admin: true,
    },
  });
  console.log('✓ 创建管理员用户');

  // Mock 图片 URLs
  const mockImages = {
    outer: 'https://via.placeholder.com/400x300/f0f0f0/666?text=外包装',
    label: 'https://via.placeholder.com/400x300/e6f7ff/1890ff?text=面单',
    inner: 'https://via.placeholder.com/400x300/f6ffed/52c41a?text=内物',
  };

  // 3. 创建订单 1: 待用户确认 (UNINBOUND 状态，包裹已入库等待确认)
  const order1 = await prisma.order.create({
    data: {
      user_id: testUser.id,
      status: OrderStatus.USER_CONFIRM_PENDING,
      payment_status: PaymentStatus.UNPAID,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前更新
    },
  });

  // 创建包裹 (已入库，等待用户确认)
  const pkg1 = await prisma.package.create({
    data: {
      order_id: order1.id,
      domestic_tracking_no: 'SF1234567890',
      source_platform: '淘宝',
      status: PackageStatus.INBOUNDED,
      actual_weight: 2.5,
      length: 30,
      width: 25,
      height: 15,
      volume_weight: (30 * 25 * 15) / 6000,
      inbound_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [
          { name: '运动鞋', quantity: 1, unit_value: 299 },
          { name: '袜子', quantity: 3, unit_value: 15 },
        ],
      },
      images: {
        create: [
          { type: ImageType.OUTER, url: mockImages.outer },
          { type: ImageType.LABEL, url: mockImages.label },
          { type: ImageType.INNER, url: mockImages.inner },
        ],
      },
    },
  });

  // 创建入库记录
  await prisma.inboundRecord.create({
    data: {
      package_id: pkg1.id,
      operator_id: adminUser.id,
      notes: '包裹完好，已拍照入库',
    },
  });

  // 更新订单重量
  await prisma.order.update({
    where: { id: order1.id },
    data: {
      total_actual_weight: pkg1.actual_weight ?? 0,
      total_volume_weight: pkg1.volume_weight ?? 0,
      chargeable_weight: Math.max(pkg1.actual_weight ?? 0, pkg1.volume_weight ?? 0),
    },
  });

  console.log('✓ 创建订单 1: 待用户确认 (订单ID:', order1.id.slice(0, 8) + ')');

  // 4. 创建订单 2: 待支付 (已确认，等待支付)
  const order2 = await prisma.order.create({
    data: {
      user_id: testUser.id,
      status: OrderStatus.PAYMENT_PENDING,
      payment_status: PaymentStatus.UNPAID,
      total_actual_weight: 5.2,
      total_volume_weight: 4.8,
      chargeable_weight: 5.2,
      estimated_price: 156,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 创建两个已确认的包裹
  const pkg2_1 = await prisma.package.create({
    data: {
      order_id: order2.id,
      domestic_tracking_no: 'YT9876543210',
      source_platform: '京东',
      status: PackageStatus.CONFIRMED,
      actual_weight: 3.0,
      length: 35,
      width: 30,
      height: 20,
      volume_weight: (35 * 30 * 20) / 6000,
      inbound_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      user_confirmed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [{ name: '电动牙刷', quantity: 1, unit_value: 199 }],
      },
      images: {
        create: [
          { type: ImageType.OUTER, url: mockImages.outer },
          { type: ImageType.INNER, url: mockImages.inner },
        ],
      },
    },
  });

  const pkg2_2 = await prisma.package.create({
    data: {
      order_id: order2.id,
      domestic_tracking_no: 'SF1122334455',
      source_platform: '拼多多',
      status: PackageStatus.CONFIRMED,
      actual_weight: 2.2,
      length: 25,
      width: 20,
      height: 12,
      volume_weight: (25 * 20 * 12) / 6000,
      inbound_time: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      user_confirmed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [{ name: '手机壳', quantity: 2, unit_value: 25 }],
      },
      images: {
        create: [
          { type: ImageType.OUTER, url: mockImages.outer },
          { type: ImageType.LABEL, url: mockImages.label },
        ],
      },
    },
  });

  console.log('✓ 创建订单 2: 待支付 (订单ID:', order2.id.slice(0, 8) + ')');

  // 5. 创建订单 3: 已发货 (已支付并发出)
  const order3 = await prisma.order.create({
    data: {
      user_id: testUser.id,
      status: OrderStatus.SHIPPED,
      payment_status: PaymentStatus.PAID,
      total_actual_weight: 1.8,
      total_volume_weight: 1.5,
      chargeable_weight: 1.8,
      estimated_price: 89,
      final_price: 89,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // 创建已发货的包裹
  const pkg3 = await prisma.package.create({
    data: {
      order_id: order3.id,
      domestic_tracking_no: 'JD5555666677',
      source_platform: '天猫',
      status: PackageStatus.CONFIRMED,
      actual_weight: 1.8,
      length: 22,
      width: 18,
      height: 10,
      volume_weight: (22 * 18 * 10) / 6000,
      inbound_time: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      user_confirmed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [{ name: '耳机', quantity: 1, unit_value: 129 }],
      },
      images: {
        create: [
          { type: ImageType.OUTER, url: mockImages.outer },
          { type: ImageType.INNER, url: mockImages.inner },
        ],
      },
    },
  });

  // 创建发货信息
  await prisma.shipment.create({
    data: {
      order_id: order3.id,
      provider: 'DHL',
      tracking_number: 'DHL7890123456',
      shipped_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'IN_TRANSIT',
    },
  });

  // 记录发货操作日志
  await prisma.adminLog.create({
    data: {
      admin_id: adminUser.id,
      order_id: order3.id,
      action: AdminAction.OVERRIDE_SHIP,
      details: { provider: 'DHL', tracking_number: 'DHL7890123456' },
    },
  });

  console.log('✓ 创建订单 3: 已发货 (订单ID:', order3.id.slice(0, 8) + ')');

  // 6. 创建订单 4: 有异常的包裹
  const order4 = await prisma.order.create({
    data: {
      user_id: testUser.id,
      status: OrderStatus.USER_CONFIRM_PENDING,
      payment_status: PaymentStatus.UNPAID,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  const pkg4 = await prisma.package.create({
    data: {
      order_id: order4.id,
      domestic_tracking_no: 'SF9999888877',
      source_platform: '淘宝',
      status: PackageStatus.INBOUNDED,
      actual_weight: 3.5,
      length: 40,
      width: 35,
      height: 20,
      volume_weight: (40 * 35 * 20) / 6000,
      inbound_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      goodsItems: {
        create: [{ name: '衣服', quantity: 2, unit_value: 99 }],
      },
      images: {
        create: [
          { type: ImageType.OUTER, url: mockImages.outer },
          { type: ImageType.LABEL, url: mockImages.label },
        ],
      },
      exceptions: {
        create: [
          {
            type: 'WRONG_ITEM',
            status: 'OPEN',
            description: '收到的商品与描述不符',
          },
        ],
      },
    },
  });

  // 更新订单重量
  await prisma.order.update({
    where: { id: order4.id },
    data: {
      total_actual_weight: pkg4.actual_weight ?? 0,
      total_volume_weight: pkg4.volume_weight ?? 0,
      chargeable_weight: Math.max(pkg4.actual_weight ?? 0, pkg4.volume_weight ?? 0),
    },
  });

  console.log('✓ 创建订单 4: 有异常待处理 (订单ID:', order4.id.slice(0, 8) + ')');

  // 7. 创建一些 AdminLog 示例
  await prisma.adminLog.create({
    data: {
      admin_id: adminUser.id,
      order_id: order1.id,
      action: AdminAction.OVERRIDE_STATUS,
      details: { from: 'UNINBOUND', to: 'USER_CONFIRM_PENDING' },
    },
  });

  console.log('✓ 创建 Admin 操作日志');

  console.log('\n=== 测试数据生成完成 ===');
  console.log('测试用户:', testUser.user_code);
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
