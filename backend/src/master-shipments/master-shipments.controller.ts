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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';
import { MasterShipmentsService } from './master-shipments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

class CreateMasterShipmentDto {
  @IsString() vendorName: string;
  @IsString() vendorTrackingNo: string;
  @IsArray() @ArrayNotEmpty() @ArrayMinSize(1) @IsUUID('all', { each: true }) customerShipmentIds: string[];
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() adminNote?: string;
}

class UpdateStatusDto {
  @IsString() status: string;
}

class AddCustomerShipmentsDto {
  @IsArray() customerShipmentIds: string[];
}

class UpdateMasterShipmentDto {
  @IsString() @IsOptional() vendorName?: string;
  @IsString() @IsOptional() vendorTrackingNo?: string;
  @IsString() @IsOptional() adminNote?: string;
  @IsString() @IsOptional() publicTitle?: string;
  @IsString() @IsOptional() publicSummary?: string;
  @IsString() @IsOptional() publicStatusText?: string;
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicVisible?: boolean;
}

class UpdatePublicationDto {
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicVisible?: boolean;
  @IsString() @IsOptional() publicTitle?: string;
  @IsString() @IsOptional() publicSummary?: string;
  @IsString() @IsOptional() publicStatusText?: string;
}

@ApiTags('Admin - MasterShipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/master-shipments')
export class MasterShipmentsController {
  constructor(private readonly service: MasterShipmentsService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create master shipment / batch' })
  create(@Body() dto: CreateMasterShipmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List master shipments' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'publicVisible', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
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
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] General update (vendorName, vendorTrackingNo, adminNote, publicTitle, publicSummary, publicStatusText, publicVisible)' })
  update(@Param('id') id: string, @Body() dto: UpdateMasterShipmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete master shipment. Requires ?confirm=DELETE_HARD. Only CREATED status, no linked customer shipments.' })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '[Admin] Update master shipment status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Post(':id/customer-shipments')
  @ApiOperation({ summary: '[Admin] Add customer shipments to batch' })
  addCustomerShipments(@Param('id') id: string, @Body() dto: AddCustomerShipmentsDto) {
    return this.service.addCustomerShipments(id, dto.customerShipmentIds);
  }

  @Delete(':id/customer-shipments/:csId')
  @ApiOperation({ summary: '[Admin] Remove customer shipment from batch' })
  removeCustomerShipment(@Param('id') id: string, @Param('csId') csId: string) {
    return this.service.removeCustomerShipment(id, csId);
  }

  @Patch(':id/publication')
  @ApiOperation({ summary: '[Admin] Set public visibility and announcement text' })
  updatePublication(@Param('id') id: string, @Body() dto: UpdatePublicationDto) {
    return this.service.updatePublication(id, dto);
  }
}
