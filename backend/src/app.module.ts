import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { PackageModule } from './package/package.module';
import { ImageModule } from './image/image.module';
import { ExceptionModule } from './exception/exception.module';
import { PaymentModule } from './payment/payment.module';
import { ShipmentModule } from './shipment/shipment.module';
import { QrModule } from './qr/qr.module';
import { NotificationModule } from './notification/notification.module';
import { AddressModule } from './address/address.module';
import { AdminLogModule } from './adminlog/adminlog.module';
import { StorageModule } from './storage/storage.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    OrderModule,
    PackageModule,
    ImageModule,
    ExceptionModule,
    PaymentModule,
    ShipmentModule,
    QrModule,
    NotificationModule,
    AddressModule,
    AdminLogModule,
    StorageModule,
    HealthModule,
  ],
})
export class AppModule {}
