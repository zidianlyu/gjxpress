import { Module } from '@nestjs/common';
import { AdminLogController } from './adminlog.controller';
import { AdminLogService } from './adminlog.service';

@Module({
  controllers: [AdminLogController],
  providers: [AdminLogService],
})
export class AdminLogModule {}
