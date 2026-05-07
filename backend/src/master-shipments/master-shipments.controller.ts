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
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
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

class CreateMasterShipmentDto {
  @ApiProperty({ description: 'Vendor or carrier name.' })
  @IsString() vendorName: string;
  @ApiProperty({ description: 'Vendor tracking number.' })
  @IsString() vendorTrackingNo: string;
  @ApiProperty({ type: [String], format: 'uuid', description: 'Customer shipment ids included in this batch.' })
  @IsArray() @ArrayNotEmpty() @ArrayMinSize(1) @IsUUID('all', { each: true }) customerShipmentIds: string[];
  @ApiPropertyOptional({ description: 'Initial master shipment status.' })
  @IsString() @IsOptional() status?: string;
  @ApiPropertyOptional({ description: 'Admin note.' })
  @IsString() @IsOptional() adminNote?: string;
}

class UpdateMasterShipmentStatusDto {
  @ApiProperty({ description: 'Master shipment status.' })
  @IsString() status: string;
}

class AddCustomerShipmentsDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'Customer shipment ids to add.' })
  @IsArray() customerShipmentIds: string[];
}

class UpdateMasterShipmentDto {
  @ApiPropertyOptional({ description: 'Vendor or carrier name.' })
  @IsString() @IsOptional() vendorName?: string;
  @ApiPropertyOptional({ description: 'Vendor tracking number.' })
  @IsString() @IsOptional() vendorTrackingNo?: string;
  @ApiPropertyOptional({ description: 'Admin note.' })
  @IsString() @IsOptional() adminNote?: string;
  @ApiPropertyOptional({ description: 'Public title shown on public batch updates.' })
  @IsString() @IsOptional() publicTitle?: string;
  @ApiPropertyOptional({ description: 'Public summary shown on public batch updates.' })
  @IsString() @IsOptional() publicSummary?: string;
  @ApiPropertyOptional({ description: 'Public status text.' })
  @IsString() @IsOptional() publicStatusText?: string;
  @ApiPropertyOptional({ type: Boolean, description: 'Whether this batch is visible publicly.' })
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicVisible?: boolean;
}

class UpdatePublicationDto {
  @ApiPropertyOptional({ type: Boolean, description: 'Whether this batch is visible publicly.' })
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicVisible?: boolean;
  @ApiPropertyOptional({ description: 'Public title shown on public batch updates.' })
  @IsString() @IsOptional() publicTitle?: string;
  @ApiPropertyOptional({ description: 'Public summary shown on public batch updates.' })
  @IsString() @IsOptional() publicSummary?: string;
  @ApiPropertyOptional({ description: 'Public status text.' })
  @IsString() @IsOptional() publicStatusText?: string;
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
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search batch number, vendor, tracking, or public text.' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Master shipment status filter.' })
  @ApiQuery({ name: 'publicVisible', required: false, type: Boolean, description: 'Public visibility filter.' })
  @ApiPaginationQueries()
  @ApiPaginatedOk('Master shipments with customerShipmentCount plus pagination.')
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('publicVisible') publicVisible?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findAll({ q, status, publicVisible, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get master shipment detail' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiGenericOk('Master shipment detail.')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] General update (vendorName, vendorTrackingNo, adminNote, publicTitle, publicSummary, publicStatusText, publicVisible)' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiGenericOk('Master shipment updated.')
  update(@Param('id') id: string, @Body() dto: UpdateMasterShipmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete master shipment. Requires ?confirm=DELETE_HARD. Only CREATED status, no linked customer shipments.' })
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
  @ApiOperation({ summary: '[Admin] Set public visibility and announcement text' })
  @ApiIdParam('id', 'Master shipment id')
  @ApiGenericOk('Publication settings updated.')
  updatePublication(@Param('id') id: string, @Body() dto: UpdatePublicationDto) {
    return this.service.updatePublication(id, dto);
  }
}
