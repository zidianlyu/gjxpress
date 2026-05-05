import { Module } from '@nestjs/common';
import { InboundPackagesController } from './inbound-packages.controller';
import { InboundPackagesService } from './inbound-packages.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminImageModule } from '../admin-image/admin-image.module';

@Module({
  imports: [PrismaModule, AdminImageModule],
  controllers: [InboundPackagesController],
  providers: [InboundPackagesService],
  exports: [InboundPackagesService],
})
export class InboundPackagesModule {}
