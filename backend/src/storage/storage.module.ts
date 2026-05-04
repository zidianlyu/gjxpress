import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
