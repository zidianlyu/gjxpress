import { Module } from '@nestjs/common';
import { MasterShipmentsController } from './master-shipments.controller';
import { MasterShipmentsService } from './master-shipments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MasterShipmentsController],
  providers: [MasterShipmentsService],
  exports: [MasterShipmentsService],
})
export class MasterShipmentsModule {}
