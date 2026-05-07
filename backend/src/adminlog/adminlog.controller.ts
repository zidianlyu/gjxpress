import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminLogService } from './adminlog.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { ApiGenericOk, ApiStandardResponses } from '../common/swagger/api-docs';

@ApiTags('AdminLog')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin-logs')
export class AdminLogController {
  constructor(private adminLogService: AdminLogService) {}

  @Get()
  @ApiOperation({ summary: '[Admin] List admin operation logs' })
  @ApiQuery({ name: 'orderId', required: false, type: String, description: 'Legacy filter passed to service listLogs.' })
  @ApiGenericOk('Admin operation log array.')
  list(@Query('orderId') orderId?: string) {
    return this.adminLogService.listLogs(orderId);
  }
}
