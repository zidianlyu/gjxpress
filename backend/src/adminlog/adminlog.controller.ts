import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminLogService } from './adminlog.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('AdminLog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin-logs')
export class AdminLogController {
  constructor(private adminLogService: AdminLogService) {}

  @Get()
  @ApiOperation({ summary: '[Admin] List admin operation logs' })
  list(@Query('orderId') orderId?: string) {
    return this.adminLogService.listLogs(orderId);
  }
}
