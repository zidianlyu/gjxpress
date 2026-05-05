import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminImageService } from './admin-image.service';

@Module({
  imports: [ConfigModule],
  providers: [AdminImageService],
  exports: [AdminImageService],
})
export class AdminImageModule {}
