import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class AdminListOrdersQueryDto {
  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() paymentStatus?: string;
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
}

class AdminUpdateOrderStatusDto {
  @IsString() status: string;
  @IsOptional() @IsString() reason?: string;
}

class AdminUpdatePaymentStatusDto {
  @IsString() paymentStatus: string;
  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() paymentMethod?: string;
  @IsOptional() @IsString() proofImageId?: string;
  @IsOptional() @IsString() reason?: string;
}

class AdminInboundPackageDto {
  @IsOptional() @IsString() userCode?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() orderId?: string;
  @IsOptional() @IsString() domesticTrackingNo?: string;
  @IsOptional() @IsString() sourcePlatform?: string;
  @IsOptional() @IsNumber() actualWeight?: number;
  @IsOptional() @IsNumber() lengthCm?: number;
  @IsOptional() @IsNumber() widthCm?: number;
  @IsOptional() @IsNumber() heightCm?: number;
  @IsOptional() @IsString() remark?: string;
  @IsOptional() imageIds?: string[];
}

class AdminUpdatePackageDto {
  @IsOptional() @IsNumber() actualWeight?: number;
  @IsOptional() @IsNumber() lengthCm?: number;
  @IsOptional() @IsNumber() widthCm?: number;
  @IsOptional() @IsNumber() heightCm?: number;
  @IsOptional() @IsString() remark?: string;
}

class AdminListExceptionsQueryDto {
  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() type?: string;
}

class AdminUpdateExceptionDto {
  @IsString() status: string;
  @IsOptional() @IsString() resolution?: string;
  @IsOptional() @IsString() nextOrderStatus?: string;
}

class AdminCreateShipmentDto {
  @IsString() orderId: string;
  @IsString() provider: string;
  @IsOptional() @IsString() trackingNumber?: string;
  @IsOptional() @IsString() shippedAt?: string;
  @IsOptional() @IsString() estimatedArrivalAt?: string;
  @IsOptional() @IsBoolean() override?: boolean;
  @IsOptional() @IsString() reason?: string;
}

class AdminGenerateQrDto {
  @IsOptional() @IsString() purpose?: string;
  @IsOptional() @IsNumber() expiresInHours?: number;
}

class AdminListUsersQueryDto {
  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
  @IsOptional() @IsString() search?: string;
}

class AdminCreateRecommendationDto {
  @IsString() title: string;
  @IsString() slug: string;
  @IsOptional() @IsString() summary?: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() tags?: string[];
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ─── Users ──────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: '[Admin] List users with pagination and search' })
  listUsers(@Query() query: AdminListUsersQueryDto) {
    return this.adminService.listUsers(query.page, query.pageSize, query.search);
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: '[Admin] List all orders with filters' })
  listOrders(@Query() query: AdminListOrdersQueryDto) {
    return this.adminService.listOrders(query);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: '[Admin] Get order detail (with admin fields)' })
  getOrder(@Param('orderId') orderId: string) {
    return this.adminService.getOrderDetail(orderId);
  }

  @Post('orders')
  @ApiOperation({ summary: '[Admin] Create order for a user' })
  createOrder(@Body() body: { userId?: string; userCode?: string; remark?: string }, @CurrentUser() user: any) {
    return this.adminService.createOrder(body, user.id);
  }

  @Patch('orders/:orderId/status')
  @ApiOperation({ summary: '[Admin] Update order status' })
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: AdminUpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.updateOrderStatus(orderId, dto.status, dto.reason, user.id);
  }

  @Patch('orders/:orderId/payment-status')
  @ApiOperation({ summary: '[Admin] Update payment status' })
  updatePaymentStatus(
    @Param('orderId') orderId: string,
    @Body() dto: AdminUpdatePaymentStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.updatePaymentStatus(orderId, dto, user.id);
  }

  @Post('orders/:orderId/qr')
  @ApiOperation({ summary: '[Admin] Generate QR token for order delivery confirmation' })
  generateQr(
    @Param('orderId') orderId: string,
    @Body() dto: AdminGenerateQrDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.generateQr(orderId, dto.purpose, dto.expiresInHours);
  }

  // ─── Packages ────────────────────────────────────────────────────────────────

  @Post('packages/inbound')
  @ApiOperation({ summary: '[Admin] Inbound a new package' })
  inboundPackage(@Body() dto: AdminInboundPackageDto, @CurrentUser() user: any) {
    return this.adminService.inboundPackage(dto, user.id);
  }

  @Patch('packages/:packageId')
  @ApiOperation({ summary: '[Admin] Update package measurements or remark' })
  updatePackage(
    @Param('packageId') packageId: string,
    @Body() dto: AdminUpdatePackageDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.updatePackage(packageId, dto, user.id);
  }

  // ─── Exceptions ──────────────────────────────────────────────────────────────

  @Get('exceptions')
  @ApiOperation({ summary: '[Admin] List all exceptions' })
  listExceptions(@Query() query: AdminListExceptionsQueryDto) {
    return this.adminService.listExceptions(query.page, query.pageSize, query.status, query.type);
  }

  @Patch('exceptions/:exceptionId')
  @ApiOperation({ summary: '[Admin] Update exception status/resolution' })
  updateException(
    @Param('exceptionId') exceptionId: string,
    @Body() dto: AdminUpdateExceptionDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.updateException(exceptionId, dto, user.id);
  }

  // ─── Shipments ───────────────────────────────────────────────────────────────

  @Post('shipments')
  @ApiOperation({ summary: '[Admin] Create shipment for an order' })
  createShipment(@Body() dto: AdminCreateShipmentDto, @CurrentUser() user: any) {
    return this.adminService.createShipment(dto, user.id);
  }

  // ─── Notifications ───────────────────────────────────────────────────────────

  @Get('notifications')
  @ApiOperation({ summary: '[Admin] List all notifications' })
  listNotifications() {
    return this.adminService.listNotifications();
  }

  // ─── Action Logs ─────────────────────────────────────────────────────────────

  @Get('action-logs')
  @ApiOperation({ summary: '[Admin] List admin action logs' })
  listActionLogs(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
  ) {
    return this.adminService.listActionLogs(page, pageSize, targetType, targetId);
  }

  // ─── Recommendations ─────────────────────────────────────────────────────────

  @Post('recommendations')
  @ApiOperation({ summary: '[Admin] Create recommendation article' })
  createRecommendation(@Body() dto: AdminCreateRecommendationDto, @CurrentUser() user: any) {
    return this.adminService.createRecommendation(dto);
  }
}
