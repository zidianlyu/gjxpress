import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUUID, IsBoolean, IsInt, Min, Matches, ValidateIf, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomerShipmentsService } from './customer-shipments.service';
import { AdminImageService } from '../admin-image/admin-image.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import {
  ApiGenericCreated,
  ApiGenericOk,
  ApiIdParam,
  ApiMultipartFile,
  ApiItemsPaginatedOk,
  ApiPaginationQueries,
  ApiStandardResponses,
  deletedSchema,
  imageListSchema,
  imageMutationSchema,
} from '../common/swagger/api-docs';

const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
const SHIPMENT_TYPES = ['AIR_GENERAL', 'AIR_SENSITIVE', 'SEA'];

function normalizeDecimalInput(value: unknown): unknown {
  if (value === undefined || value === null) return value;
  return String(value).trim();
}

class UpdateCustomerShipmentDto {
  @ApiPropertyOptional({ description: 'Customer business code. If present, resolves to internal customerId.', example: 'GJ5901' })
  @IsString() @IsOptional() @Transform(({ value }) => String(value).trim().toUpperCase()) @Matches(/^GJ\d{4}$/, { message: 'customerCode must match /^GJ\\d{4}$/' }) customerCode?: string;
  @ApiPropertyOptional({ description: 'Admin/customer shipment notes.' })
  @IsString() @IsOptional() notes?: string;
  @ApiPropertyOptional({ enum: SHIPMENT_TYPES, description: 'Shipment type: AIR_GENERAL=空运普货, AIR_SENSITIVE=空运敏货, SEA=海运.' })
  @IsIn(SHIPMENT_TYPES) @IsOptional() shipmentType?: string;
  @ApiPropertyOptional({ description: 'International carrier tracking number.' })
  @IsString() @IsOptional() internationalTrackingNo?: string;
  @ApiPropertyOptional({ type: Boolean, description: 'Whether public tracking endpoint can show this shipment.' })
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicTrackingEnabled?: boolean;
  @ApiPropertyOptional({ description: 'Customer shipment status.' })
  @IsString() @IsOptional() status?: string;
  @ApiPropertyOptional({ enum: ['UNPAID', 'PAID', 'REFUNDED'], description: 'Payment status.' })
  @IsIn(['UNPAID', 'PAID', 'REFUNDED']) @IsOptional() paymentStatus?: string;
  @ApiPropertyOptional({ type: Number, description: 'Number of pieces in this customer shipment.' })
  @IsInt() @Min(1) @Type(() => Number) @IsOptional() quantity?: number;
  @ApiPropertyOptional({ description: 'Actual weight in kg, accepted as a non-negative decimal string or number.', example: '2.50' })
  @Transform(({ value }) => normalizeDecimalInput(value))
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Matches(DECIMAL_PATTERN, { message: 'actualWeightKg must be a non-negative decimal string, e.g. "2", "2.5", or "2.50"' })
  actualWeightKg?: string;
  @ApiPropertyOptional({ description: 'Volume formula text.' })
  @IsString() @IsOptional() volumeFormula?: string;
  @ApiPropertyOptional({ description: 'Billing rate CNY per kg, accepted as a non-negative decimal string or number.', example: '80' })
  @Transform(({ value }) => normalizeDecimalInput(value))
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Matches(DECIMAL_PATTERN, { message: 'billingRateCnyPerKg must be a non-negative decimal string, e.g. "80" or "80.50"' })
  billingRateCnyPerKg?: string;
  @ApiPropertyOptional({ description: 'Billing weight in kg, accepted as a non-negative decimal string or number.', example: '3' })
  @Transform(({ value }) => normalizeDecimalInput(value))
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Matches(DECIMAL_PATTERN, { message: 'billingWeightKg must be a non-negative decimal string, e.g. "3", "3.5", or "3.50"' })
  billingWeightKg?: string;
}

class CreateCustomerShipmentDto {
  @ApiProperty({ description: 'Customer business code. Backend resolves this to internal customerId.', example: 'GJ5901' })
  @IsString() @Transform(({ value }) => String(value).trim().toUpperCase()) @Matches(/^GJ\d{4}$/, { message: 'customerCode must match /^GJ\\d{4}$/' }) customerCode: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Deprecated compatibility field. customerCode takes precedence.' })
  @IsUUID() @IsOptional() customerId?: string;
  @ApiPropertyOptional({ type: [String], description: 'Inbound package ids to include.' })
  @IsArray() @IsUUID(undefined, { each: true }) @IsOptional() inboundPackageIds?: string[];
  @ApiPropertyOptional({ enum: SHIPMENT_TYPES, default: 'AIR_GENERAL', description: 'Shipment type: AIR_GENERAL=空运普货, AIR_SENSITIVE=空运敏货, SEA=海运.' })
  @IsIn(SHIPMENT_TYPES) @IsOptional() shipmentType?: string;
  @ApiPropertyOptional({ description: 'Notes.' })
  @IsString() @IsOptional() notes?: string;
  @ApiPropertyOptional({ type: Number, default: 1, description: 'Number of pieces in this customer shipment.' })
  @IsInt() @Min(1) @Type(() => Number) @IsOptional() quantity?: number;
  @ApiPropertyOptional({ description: 'Actual weight in kg, accepted as a non-negative decimal string or number.', example: '2.50' })
  @Transform(({ value }) => normalizeDecimalInput(value))
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Matches(DECIMAL_PATTERN, { message: 'actualWeightKg must be a non-negative decimal string, e.g. "2", "2.5", or "2.50"' })
  actualWeightKg?: string;
  @ApiPropertyOptional({ description: 'Volume formula text.' })
  @IsString() @IsOptional() volumeFormula?: string;
  @ApiPropertyOptional({ description: 'Billing rate CNY per kg, accepted as a non-negative decimal string or number.', example: '80' })
  @Transform(({ value }) => normalizeDecimalInput(value))
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Matches(DECIMAL_PATTERN, { message: 'billingRateCnyPerKg must be a non-negative decimal string, e.g. "80" or "80.50"' })
  billingRateCnyPerKg?: string;
  @ApiPropertyOptional({ description: 'Billing weight in kg, accepted as a non-negative decimal string or number.', example: '3' })
  @Transform(({ value }) => normalizeDecimalInput(value))
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Matches(DECIMAL_PATTERN, { message: 'billingWeightKg must be a non-negative decimal string, e.g. "3", "3.5", or "3.50"' })
  billingWeightKg?: string;
}

class UpdateShipmentStatusDto {
  @ApiProperty({ enum: ['PACKED', 'SHIPPED', 'ARRIVED', 'READY_FOR_PICKUP', 'PICKED_UP', 'EXCEPTION'], description: 'Customer shipment status.' })
  @IsString() status: string;
  @ApiPropertyOptional({ format: 'date-time', description: 'Optional forced timestamp.' })
  @IsString() @IsOptional() forcedAt?: string;
}

class UpdatePaymentStatusDto {
  @ApiProperty({ enum: ['UNPAID', 'PAID', 'REFUNDED'], description: 'Payment status.' })
  @IsIn(['UNPAID', 'PAID', 'REFUNDED']) paymentStatus: string;
}

class AddItemDto {
  @ApiProperty({ format: 'uuid', description: 'Inbound package id.' })
  @IsUUID() inboundPackageId: string;
}


@ApiTags('Admin - CustomerShipments')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true, conflict: true })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/customer-shipments')
export class CustomerShipmentsController {
  constructor(
    private readonly service: CustomerShipmentsService,
    private readonly imageService: AdminImageService,
  ) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create customer shipment' })
  @ApiGenericCreated('Customer shipment created.')
  create(@Body() dto: CreateCustomerShipmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List customer shipments' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search shipment number, customer code, tracking number, or notes.' })
  @ApiQuery({ name: 'status', required: false, enum: ['PACKED', 'SHIPPED', 'ARRIVED', 'READY_FOR_PICKUP', 'PICKED_UP', 'EXCEPTION'], description: 'Shipment status filter.' })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: ['UNPAID', 'PAID', 'REFUNDED'], description: 'Payment status filter.' })
  @ApiQuery({ name: 'shipmentType', required: false, enum: SHIPMENT_TYPES, description: 'Shipment type filter.' })
  @ApiQuery({ name: 'customerId', required: false, type: String, description: 'Customer id filter.' })
  @ApiQuery({ name: 'masterShipmentId', required: false, type: String, description: 'Master shipment id filter.' })
  @ApiQuery({ name: 'unbatched', required: false, type: Boolean, description: 'true = only shipments not yet in any batch.' })
  @ApiPaginationQueries()
  @ApiItemsPaginatedOk('Customer shipments with itemCount plus pagination.')
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('shipmentType') shipmentType?: string,
    @Query('customerId') customerId?: string,
    @Query('masterShipmentId') masterShipmentId?: string,
    @Query('unbatched') unbatched?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findAll({ q, status, paymentStatus, shipmentType, customerId, masterShipmentId, unbatched, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get customer shipment detail' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiGenericOk('Customer shipment detail.')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] General update (notes, trackingNo, publicTrackingEnabled, status, paymentStatus)' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiGenericOk('Customer shipment updated.')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerShipmentDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '[Admin] Update customer shipment status' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiGenericOk('Customer shipment status updated.')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateShipmentStatusDto) {
    return this.service.updateStatus(id, dto.status, dto.forcedAt);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: '[Admin] Update customer shipment payment status' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiGenericOk('Customer shipment payment status updated.')
  updatePaymentStatus(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
    return this.service.updatePaymentStatus(id, dto.paymentStatus);
  }

  @Post(':id/items')
  @ApiOperation({ summary: '[Admin] Add inbound package to shipment' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiGenericCreated('Inbound package added to shipment.')
  addItem(@Param('id') id: string, @Body() dto: AddItemDto) {
    return this.service.addItem(id, dto.inboundPackageId);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: '[Admin] Remove inbound package from shipment' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiIdParam('itemId', 'Customer shipment item id')
  @ApiGenericOk('Inbound package removed from shipment.')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(id, itemId);
  }

  @Get(':id/images')
  @ApiOperation({ summary: '[Admin] Get image list for customer shipment' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiResponse({ status: 200, description: 'Image URL list.', schema: imageListSchema })
  getImages(@Param('id') id: string) {
    return this.service.getImages(id);
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Upload image for customer shipment. Stores in Supabase Storage and appends public URL to imageUrls.' })
  @ApiConsumes('multipart/form-data')
  @ApiIdParam('id', 'Customer shipment id')
  @ApiMultipartFile('file')
  @ApiResponse({ status: 201, description: 'Image uploaded and attached.', schema: imageMutationSchema })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('file is required (multipart/form-data field: file)');
    const url = await this.imageService.upload(file, 'customer-shipments', id);
    return this.service.addImage(id, url);
  }

  @Delete(':id/images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete image from customer shipment. Requires ?imageUrl=<encoded-url>&confirm=DELETE_HARD.' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiQuery({ name: 'imageUrl', required: true, type: String, description: 'Exact encoded public image URL to remove.' })
  @ApiQuery({ name: 'confirm', required: true, type: String, description: 'Must be DELETE_HARD.', example: 'DELETE_HARD' })
  @ApiResponse({ status: 200, description: 'Image deleted from storage and shipment imageUrls.', schema: imageMutationSchema })
  async deleteImage(
    @Param('id') id: string,
    @Query('imageUrl') imageUrl: string,
    @Query('confirm') confirm: string,
  ) {
    if (!imageUrl) throw new BadRequestException('imageUrl query param is required');
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException('Must pass confirm=DELETE_HARD to confirm image deletion');
    }
    const images = await this.service.getImages(id);
    if (!images.items.includes(imageUrl)) {
      throw new BadRequestException('imageUrl not found in this shipment');
    }
    await this.imageService.delete(imageUrl);
    return this.service.removeImage(id, imageUrl, confirm);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete customer shipment. Requires ?confirm=DELETE_HARD. Blocked if in transit/completed, linked to MasterShipment, or has transactions.' })
  @ApiIdParam('id', 'Customer shipment id')
  @ApiQuery({ name: 'confirm', required: true, type: String, description: 'Must be DELETE_HARD.', example: 'DELETE_HARD' })
  @ApiResponse({ status: 200, description: 'Customer shipment hard deleted.', schema: deletedSchema })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }
}
