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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomerShipmentsService } from './customer-shipments.service';
import { AdminImageService } from '../admin-image/admin-image.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

class UpdateCustomerShipmentDto {
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() internationalTrackingNo?: string;
  @IsBoolean() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) publicTrackingEnabled?: boolean;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() paymentStatus?: string;
  @IsString() @IsOptional() actualWeightKg?: string;
  @IsString() @IsOptional() volumeFormula?: string;
  @IsString() @IsOptional() billingRateCnyPerKg?: string;
  @IsString() @IsOptional() billingWeightKg?: string;
}

class CreateCustomerShipmentDto {
  @IsUUID() customerId: string;
  @IsArray() @IsOptional() inboundPackageIds?: string[];
  @IsString() @IsOptional() notes?: string;
  @IsString() @IsOptional() actualWeightKg?: string;
  @IsString() @IsOptional() volumeFormula?: string;
  @IsString() @IsOptional() billingRateCnyPerKg?: string;
  @IsString() @IsOptional() billingWeightKg?: string;
}

class UpdateShipmentStatusDto {
  @IsString() status: string;
  @IsString() @IsOptional() forcedAt?: string;
}

class UpdatePaymentStatusDto {
  @IsString() paymentStatus: string;
}

class AddItemDto {
  @IsUUID() inboundPackageId: string;
}


@ApiTags('Admin - CustomerShipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/customer-shipments')
export class CustomerShipmentsController {
  constructor(
    private readonly service: CustomerShipmentsService,
    private readonly imageService: AdminImageService,
  ) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create customer shipment' })
  create(@Body() dto: CreateCustomerShipmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List customer shipments' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'paymentStatus', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'masterShipmentId', required: false })
  @ApiQuery({ name: 'unbatched', required: false, description: 'true = only shipments not yet in any batch' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('customerId') customerId?: string,
    @Query('masterShipmentId') masterShipmentId?: string,
    @Query('unbatched') unbatched?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findAll({ q, status, paymentStatus, customerId, masterShipmentId, unbatched, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get customer shipment detail' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] General update (notes, trackingNo, publicTrackingEnabled, status, paymentStatus)' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerShipmentDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '[Admin] Cancel shipment (DRAFT/PACKED/EXCEPTION only). Restores package statuses to CLAIMED.' })
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '[Admin] Update customer shipment status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateShipmentStatusDto) {
    return this.service.updateStatus(id, dto.status, dto.forcedAt);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: '[Admin] Update customer shipment payment status' })
  updatePaymentStatus(@Param('id') id: string, @Body() dto: UpdatePaymentStatusDto) {
    return this.service.updatePaymentStatus(id, dto.paymentStatus);
  }

  @Post(':id/items')
  @ApiOperation({ summary: '[Admin] Add inbound package to shipment' })
  addItem(@Param('id') id: string, @Body() dto: AddItemDto) {
    return this.service.addItem(id, dto.inboundPackageId);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: '[Admin] Remove inbound package from shipment' })
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.removeItem(id, itemId);
  }

  @Get(':id/images')
  @ApiOperation({ summary: '[Admin] Get image list for customer shipment' })
  getImages(@Param('id') id: string) {
    return this.service.getImages(id);
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Upload image for customer shipment. Stores in Supabase Storage and appends public URL to imageUrls.' })
  @ApiConsumes('multipart/form-data')
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
  @ApiQuery({ name: 'imageUrl', required: true })
  @ApiQuery({ name: 'confirm', required: true, example: 'DELETE_HARD' })
  async deleteImage(
    @Param('id') id: string,
    @Query('imageUrl') imageUrl: string,
    @Query('confirm') confirm: string,
  ) {
    if (!imageUrl) throw new BadRequestException('imageUrl query param is required');
    await this.imageService.delete(imageUrl);
    return this.service.removeImage(id, imageUrl, confirm);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete customer shipment. Requires ?confirm=DELETE_HARD. Blocked if in transit/completed, linked to MasterShipment, or has transactions.' })
  @ApiQuery({ name: 'confirm', required: true, example: 'DELETE_HARD' })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }
}
