import { Module } from '@nestjs/common';
import { CustomerShipmentsController } from './customer-shipments.controller';
import { CustomerShipmentsService } from './customer-shipments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminImageModule } from '../admin-image/admin-image.module';

@Module({
  imports: [PrismaModule, AdminImageModule],
  controllers: [CustomerShipmentsController],
  providers: [CustomerShipmentsService],
  exports: [CustomerShipmentsService],
})
export class CustomerShipmentsModule {}
