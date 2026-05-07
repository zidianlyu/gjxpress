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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ApiGenericCreated,
  ApiGenericOk,
  ApiIdParam,
  ApiPaginatedOk,
  ApiPaginationQueries,
  ApiStandardResponses,
} from '../common/swagger/api-docs';

class AdminListOrdersQueryDto {
  @ApiPropertyOptional({ type: Number, description: 'Page number, starting from 1.' }) @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @ApiPropertyOptional({ type: Number, description: 'Items per page, capped at 100.' }) @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
  @ApiPropertyOptional({ description: 'Search by order/user fields.' }) @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ description: 'Order status filter.' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ description: 'Payment status filter.' }) @IsOptional() @IsString() paymentStatus?: string;
  @ApiPropertyOptional({ description: 'Created-at start date filter.', format: 'date-time' }) @IsOptional() @IsString() from?: string;
  @ApiPropertyOptional({ description: 'Created-at end date filter.', format: 'date-time' }) @IsOptional() @IsString() to?: string;
}

class AdminUpdateOrderStatusDto {
  @ApiProperty({ description: 'New order status.' })
  @IsString() status: string;
  @ApiPropertyOptional({ description: 'Reason recorded in admin logs.' })
  @IsOptional() @IsString() reason?: string;
}

class AdminUpdatePaymentStatusDto {
  @ApiProperty({ description: 'New payment status.' })
  @IsString() paymentStatus: string;
  @ApiPropertyOptional({ type: Number, description: 'Payment amount.' })
  @IsOptional() @IsNumber() amount?: number;
  @ApiPropertyOptional({ example: 'CNY' })
  @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional({ description: 'Payment method label.' })
  @IsOptional() @IsString() paymentMethod?: string;
  @ApiPropertyOptional({ description: 'Proof image id.' })
  @IsOptional() @IsString() proofImageId?: string;
  @ApiPropertyOptional({ description: 'Reason recorded in admin logs.' })
  @IsOptional() @IsString() reason?: string;
}

class AdminInboundPackageDto {
  @ApiPropertyOptional({ description: 'User code used to resolve userId.' })
  @IsOptional() @IsString() userCode?: string;
  @ApiPropertyOptional({ description: 'Target user id.' })
  @IsOptional() @IsString() userId?: string;
  @ApiPropertyOptional({ description: 'Existing order id to attach package to.' })
  @IsOptional() @IsString() orderId?: string;
  @ApiPropertyOptional({ description: 'Domestic tracking number.' })
  @IsOptional() @IsString() domesticTrackingNo?: string;
  @ApiPropertyOptional({ description: 'Source platform or merchant.' })
  @IsOptional() @IsString() sourcePlatform?: string;
  @ApiPropertyOptional({ type: Number, description: 'Actual weight in kg.' })
  @IsOptional() @IsNumber() actualWeight?: number;
  @ApiPropertyOptional({ type: Number, description: 'Length in cm.' })
  @IsOptional() @IsNumber() lengthCm?: number;
  @ApiPropertyOptional({ type: Number, description: 'Width in cm.' })
  @IsOptional() @IsNumber() widthCm?: number;
  @ApiPropertyOptional({ type: Number, description: 'Height in cm.' })
  @IsOptional() @IsNumber() heightCm?: number;
  @ApiPropertyOptional({ description: 'Admin remark.' })
  @IsOptional() @IsString() remark?: string;
  @ApiPropertyOptional({ type: [String], description: 'Existing image ids to attach.' })
  @IsOptional() imageIds?: string[];
}

class AdminUpdatePackageDto {
  @ApiPropertyOptional({ type: Number, description: 'Actual weight in kg.' })
  @IsOptional() @IsNumber() actualWeight?: number;
  @ApiPropertyOptional({ type: Number, description: 'Length in cm.' })
  @IsOptional() @IsNumber() lengthCm?: number;
  @ApiPropertyOptional({ type: Number, description: 'Width in cm.' })
  @IsOptional() @IsNumber() widthCm?: number;
  @ApiPropertyOptional({ type: Number, description: 'Height in cm.' })
  @IsOptional() @IsNumber() heightCm?: number;
  @ApiPropertyOptional({ description: 'Admin remark.' })
  @IsOptional() @IsString() remark?: string;
}

class AdminListExceptionsQueryDto {
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
  @ApiPropertyOptional({ description: 'Exception status filter.' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ description: 'Exception type filter.' }) @IsOptional() @IsString() type?: string;
}

class AdminUpdateExceptionDto {
  @ApiProperty({ description: 'New exception status.' })
  @IsString() status: string;
  @ApiPropertyOptional({ description: 'Resolution text.' })
  @IsOptional() @IsString() resolution?: string;
  @ApiPropertyOptional({ description: 'Optional next order status.' })
  @IsOptional() @IsString() nextOrderStatus?: string;
}

class AdminCreateShipmentDto {
  @ApiProperty({ description: 'Order id.' })
  @IsString() orderId: string;
  @ApiProperty({ description: 'Shipping provider.' })
  @IsString() provider: string;
  @ApiPropertyOptional({ description: 'Carrier tracking number.' })
  @IsOptional() @IsString() trackingNumber?: string;
  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional() @IsString() shippedAt?: string;
  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional() @IsString() estimatedArrivalAt?: string;
  @ApiPropertyOptional({ type: Boolean, description: 'Override paid-order precondition.' })
  @IsOptional() @IsBoolean() override?: boolean;
  @ApiPropertyOptional({ description: 'Override reason.' })
  @IsOptional() @IsString() reason?: string;
}

class AdminGenerateQrDto {
  @ApiPropertyOptional({ description: 'QR purpose.', example: 'DELIVERY_CONFIRMATION' })
  @IsOptional() @IsString() purpose?: string;
  @ApiPropertyOptional({ type: Number, description: 'Expiration in hours.' })
  @IsOptional() @IsNumber() expiresInHours?: number;
}

class AdminListUsersQueryDto {
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @ApiPropertyOptional({ type: Number }) @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
  @ApiPropertyOptional({ description: 'Search user code, nickname, or phone-like fields.' }) @IsOptional() @IsString() search?: string;
}

class AdminCreateRecommendationDto {
  @ApiProperty({ description: 'Recommendation title.' })
  @IsString() title: string;
  @ApiProperty({ description: 'Unique slug.' })
  @IsString() slug: string;
  @ApiPropertyOptional({ description: 'Short summary.' })
  @IsOptional() @IsString() summary?: string;
  @ApiPropertyOptional({ description: 'Article body.' })
  @IsOptional() @IsString() body?: string;
  @ApiPropertyOptional({ description: 'Category filter value.' })
  @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ description: 'City filter value.' })
  @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional({ type: [String], description: 'Tags.' })
  @IsOptional() tags?: string[];
  @ApiPropertyOptional({ description: 'Publication status.' })
  @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional()
  @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional()
  @IsOptional() @IsString() seoDescription?: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true, conflict: true })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ─── Users ──────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: '[Admin] List users with pagination and search' })
  @ApiPaginationQueries()
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search user records.' })
  @ApiPaginatedOk('Users with orderCount plus pagination.')
  listUsers(@Query() query: AdminListUsersQueryDto) {
    return this.adminService.listUsers(query.page, query.pageSize, query.search);
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: '[Admin] List all orders with filters' })
  @ApiPaginationQueries()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'paymentStatus', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Created-at start date.' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'Created-at end date.' })
  @ApiPaginatedOk('Orders with packageCount plus pagination.')
  listOrders(@Query() query: AdminListOrdersQueryDto) {
    return this.adminService.listOrders(query);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: '[Admin] Get order detail (with admin fields)' })
  @ApiIdParam('orderId', 'Order id')
  @ApiGenericOk('Order detail with related user and packages.')
  getOrder(@Param('orderId') orderId: string) {
    return this.adminService.getOrderDetail(orderId);
  }

  @Post('orders')
  @ApiOperation({ summary: '[Admin] Create order for a user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'Target user id. Required if userCode is omitted.' },
        userCode: { type: 'string', description: 'Target user code. Required if userId is omitted.' },
        remark: { type: 'string', nullable: true },
      },
    },
  })
  @ApiGenericCreated('Order created.')
  createOrder(@Body() body: { userId?: string; userCode?: string; remark?: string }, @CurrentUser() user: any) {
    return this.adminService.createOrder(body, user.id);
  }

  @Patch('orders/:orderId/status')
  @ApiOperation({ summary: '[Admin] Update order status' })
  @ApiIdParam('orderId', 'Order id')
  @ApiGenericOk('Order status updated.')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() dto: AdminUpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.updateOrderStatus(orderId, dto.status, dto.reason, user.id);
  }

  @Patch('orders/:orderId/payment-status')
  @ApiOperation({ summary: '[Admin] Update payment status' })
  @ApiIdParam('orderId', 'Order id')
  @ApiGenericOk('Payment status updated.')
  updatePaymentStatus(
    @Param('orderId') orderId: string,
    @Body() dto: AdminUpdatePaymentStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.adminService.updatePaymentStatus(orderId, dto, user.id);
  }

  @Post('orders/:orderId/qr')
  @ApiOperation({ summary: '[Admin] Generate QR token for order delivery confirmation' })
  @ApiIdParam('orderId', 'Order id')
  @ApiGenericCreated('QR token generated.')
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
  @ApiGenericCreated('Package inbounded.')
  inboundPackage(@Body() dto: AdminInboundPackageDto, @CurrentUser() user: any) {
    return this.adminService.inboundPackage(dto, user.id);
  }

  @Patch('packages/:packageId')
  @ApiOperation({ summary: '[Admin] Update package measurements or remark' })
  @ApiIdParam('packageId', 'Package id')
  @ApiGenericOk('Package updated.')
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
  @ApiPaginationQueries()
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiPaginatedOk('Exceptions with pagination.')
  listExceptions(@Query() query: AdminListExceptionsQueryDto) {
    return this.adminService.listExceptions(query.page, query.pageSize, query.status, query.type);
  }

  @Patch('exceptions/:exceptionId')
  @ApiOperation({ summary: '[Admin] Update exception status/resolution' })
  @ApiIdParam('exceptionId', 'Exception id')
  @ApiGenericOk('Exception updated.')
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
  @ApiGenericCreated('Shipment created.')
  createShipment(@Body() dto: AdminCreateShipmentDto, @CurrentUser() user: any) {
    return this.adminService.createShipment(dto, user.id);
  }

  // ─── Notifications ───────────────────────────────────────────────────────────

  @Get('notifications')
  @ApiOperation({ summary: '[Admin] List all notifications' })
  @ApiGenericOk('Notification array.')
  listNotifications() {
    return this.adminService.listNotifications();
  }

  // ─── Action Logs ─────────────────────────────────────────────────────────────

  @Get('action-logs')
  @ApiOperation({ summary: '[Admin] List admin action logs' })
  @ApiPaginationQueries()
  @ApiQuery({ name: 'targetType', required: false, type: String })
  @ApiQuery({ name: 'targetId', required: false, type: String })
  @ApiPaginatedOk('Admin action logs with pagination.')
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
  @ApiGenericCreated('Recommendation created.')
  createRecommendation(@Body() dto: AdminCreateRecommendationDto, @CurrentUser() user: any) {
    return this.adminService.createRecommendation(dto);
  }
}
