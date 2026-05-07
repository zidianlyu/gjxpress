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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, ArrayNotEmpty, ArrayMinSize, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { MasterShipmentsService } from './master-shipments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import {
  ApiGenericCreated,
  ApiGenericOk,
  ApiIdParam,
  ApiPaginatedOk,
  ApiPaginationQueries,
  ApiStandardResponses,
  deletedSchema,
} from '../common/swagger/api-docs';

const MASTER_SHIPMENT_VENDORS = ['DHL', 'UPS', 'FEDEX', 'EMS', 'OTHER'];
const MASTER_SHIPMENT_STATUSES = ['IN_TRANSIT', 'SIGNED', 'READY_FOR_PICKUP', 'EXCEPTION'];
const SHIPMENT_TYPES = ['AIR_GENERAL', 'AIR_SENSITIVE', 'SEA'];

class CreateMasterShipmentDto {
  @ApiPropertyOptional({
    enum: SHIPMENT_TYPES,
    description: 'Shipment type: AIR_GENERAL=空运普货, AIR_SENSITIVE=空运敏货, SEA=海运.',
  })
  @IsIn(SHIPMENT_TYPES) @IsOptional() shipmentType?: string;
  @ApiProperty({ enum: MASTER_SHIPMENT_VENDORS, description: '供应商. API field remains vendorName.' })
  @Transform(({ value }) => String(value).trim().toUpperCase())
  @IsIn(MASTER_SHIPMENT_VENDORS) vendorName: string;
  @ApiProperty({ description: 'Vendor tracking number.' })
  @IsString() vendorTrackingNo: string;
  @ApiProperty({ type: [String], format: 'uuid', description: 'Customer shipment ids included in this batch.' })
  @IsArray() @ArrayNotEmpty() @ArrayMinSize(1) @IsUUID('all', { each: true }) customerShipmentIds: string[];
  @ApiPropertyOptional({ type: Boolean, default: true, description: 'Whether this batch is visible in public batch updates.' })
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicPublished?: boolean;
  @ApiPropertyOptional({ description: 'Admin note.' })
  @IsString() @IsOptional() note?: string;
}

class UpdateMasterShipmentStatusDto {
  @ApiProperty({ enum: MASTER_SHIPMENT_STATUSES, description: 'Master shipment status.' })
  @IsIn(MASTER_SHIPMENT_STATUSES) status: string;
}

class AddCustomerShipmentsDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'Customer shipment ids to add.' })
  @IsArray() customerShipmentIds: string[];
}

class UpdateMasterShipmentDto {
  @ApiPropertyOptional({ description: 'Admin note.' })
  @IsString() @IsOptional() note?: string;
  @ApiPropertyOptional({ type: Boolean, description: 'Whether this batch is visible in public batch updates.' })
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicPublished?: boolean;
  @ApiPropertyOptional({ enum: MASTER_SHIPMENT_STATUSES, description: 'Master shipment status.' })
  @IsIn(MASTER_SHIPMENT_STATUSES) @IsOptional() status?: string;
}

class UpdatePublicationDto {
  @ApiPropertyOptional({ type: Boolean, description: 'Whether this batch is visible in public batch updates.' })
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicPublished?: boolean;
}

@ApiTags('Admin - MasterShipments')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true, conflict: true })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/master-shipments')
export class MasterShipmentsController {
  constructor(private readonly service: MasterShipmentsService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create master shipment / batch' })
  @ApiGenericCreated('Master shipment created.')
  create(@Body() dto: CreateMasterShipmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List master shipments' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search batch number, vendor, or tracking.' })
  @ApiQuery({ name: 'status', required: false, enum: MASTER_SHIPMENT_STATUSES, description: 'Master shipment status filter.' })
  @ApiQuery({ name: 'publicPublished', required: false, type: Boolean, description: 'Public publication filter.' })
  @ApiPaginationQueries()
  @ApiPaginatedOk('Master shipments with customerShipmentCount plus pagination.')
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('publicPublished') publicPublished?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findAll({ q, status, publicPublished, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get master shipment detail' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiGenericOk('Master shipment detail.')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update master shipment note, publicPublished, or status' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiGenericOk('Master shipment updated.')
  update(@Param('id') id: string, @Body() dto: UpdateMasterShipmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete master shipment. Requires ?confirm=DELETE_HARD. Detaches linked customer shipments.' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiQuery({ name: 'confirm', required: true, type: String, description: 'Must be DELETE_HARD.', example: 'DELETE_HARD' })
  @ApiResponse({ status: 200, description: 'Master shipment hard deleted.', schema: deletedSchema })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '[Admin] Update master shipment status' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiGenericOk('Master shipment status updated.')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateMasterShipmentStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Post(':id/customer-shipments')
  @ApiOperation({ summary: '[Admin] Add customer shipments to batch' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiGenericCreated('Customer shipments added to batch.')
  addCustomerShipments(@Param('id') id: string, @Body() dto: AddCustomerShipmentsDto) {
    return this.service.addCustomerShipments(id, dto.customerShipmentIds);
  }

  @Delete(':id/customer-shipments/:csId')
  @ApiOperation({ summary: '[Admin] Remove customer shipment from batch' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiIdParam('csId', 'Customer shipment id')
  @ApiGenericOk('Customer shipment removed from batch.')
  removeCustomerShipment(@Param('id') id: string, @Param('csId') csId: string) {
    return this.service.removeCustomerShipment(id, csId);
  }

  @Patch(':id/publication')
  @ApiOperation({ summary: '[Admin] Set public publication flag' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiGenericOk('Publication settings updated.')
  updatePublication(@Param('id') id: string, @Body() dto: UpdatePublicationDto) {
    return this.service.updatePublication(id, dto);
  }
}
