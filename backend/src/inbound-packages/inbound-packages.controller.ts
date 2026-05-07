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
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { InboundPackagesService } from './inbound-packages.service';
import { CreateInboundPackageDto } from './dto/create-inbound-package.dto';
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

class UpdateInboundPackageDto {
  @ApiPropertyOptional({ description: 'Domestic tracking number.' })
  @IsString() @IsOptional() domesticTrackingNo?: string;
  @ApiPropertyOptional({ description: 'Customer business code. Empty or null clears customer ownership.', example: 'GJ3178' })
  @IsString() @IsOptional() customerCode?: string;
  @ApiPropertyOptional({ format: 'date-time', description: 'Warehouse received timestamp.' })
  @IsString() @IsOptional() warehouseReceivedAt?: string;
  @ApiPropertyOptional({ description: 'Issue note.' })
  @IsString() @IsOptional() issueNote?: string;
  @ApiPropertyOptional({ description: 'Admin note.' })
  @IsString() @IsOptional() adminNote?: string;
  @ApiPropertyOptional({ description: 'Inbound package status.' })
  @IsString() @IsOptional() status?: string;
}

function assertValidInboundPackageId(id: string) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!id || id === 'undefined' || id === 'null' || !uuidPattern.test(id)) {
    throw new BadRequestException('Invalid inbound package id');
  }
}

class AssignCustomerDto {
  @ApiProperty({ description: 'Customer code to assign this package to.', example: 'GJ1023' })
  @IsString() customerCode: string;
}

class UpdateInboundPackageStatusDto {
  @ApiProperty({ description: 'Inbound package status.' })
  @IsString() status: string;
}


@ApiTags('Admin - InboundPackages')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true, conflict: true })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/inbound-packages')
export class InboundPackagesController {
  constructor(
    private readonly service: InboundPackagesService,
    private readonly imageService: AdminImageService,
  ) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create inbound package' })
  @ApiGenericCreated('Inbound package created.')
  create(@Body() dto: CreateInboundPackageDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List inbound packages' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search domestic tracking number, customer code, or notes.' })
  @ApiQuery({ name: 'status', required: false, enum: ['UNIDENTIFIED', 'ARRIVED', 'CONSOLIDATED'], description: 'Inbound package status filter.' })
  @ApiQuery({ name: 'customerId', required: false, type: String, description: 'Customer id filter.' })
  @ApiQuery({ name: 'customerCode', required: false, type: String, description: 'Customer business code filter, e.g. GJ3178.' })
  @ApiPaginationQueries()
  @ApiItemsPaginatedOk('Inbound packages with inShipment flag plus pagination.')
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('customerCode') customerCode?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findAll({ q, status, customerId, customerCode, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get inbound package detail' })
  @ApiIdParam('id', 'Inbound package id')
  @ApiGenericOk('Inbound package detail.')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] General update for inbound package (domesticTrackingNo, warehouseReceivedAt, issueNote, adminNote, status)' })
  @ApiIdParam('id', 'Inbound package id')
  @ApiGenericOk('Inbound package updated.')
  update(@Param('id') id: string, @Body() dto: UpdateInboundPackageDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/assign-customer')
  @ApiOperation({ summary: '[Admin] Assign customer to unclaimed package' })
  @ApiIdParam('id', 'Inbound package id')
  @ApiGenericOk('Customer assigned to inbound package.')
  assignCustomer(@Param('id') id: string, @Body() dto: AssignCustomerDto) {
    return this.service.assignCustomer(id, dto.customerCode);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '[Admin] Update inbound package status' })
  @ApiIdParam('id', 'Inbound package id')
  @ApiGenericOk('Inbound package status updated.')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateInboundPackageStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Get(':id/images')
  @ApiOperation({ summary: '[Admin] Get image list for inbound package' })
  @ApiIdParam('id', 'Inbound package id')
  @ApiGenericOk('Image URL list.')
  @ApiResponse({ status: 200, schema: imageListSchema })
  getImages(@Param('id') id: string) {
    return this.service.getImages(id);
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Upload image for inbound package. Stores in Supabase Storage and appends public URL to imageUrls.' })
  @ApiConsumes('multipart/form-data')
  @ApiIdParam('id', 'Inbound package id')
  @ApiMultipartFile('file')
  @ApiResponse({ status: 201, description: 'Image uploaded and attached.', schema: imageMutationSchema })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    assertValidInboundPackageId(id);
    if (!file) throw new BadRequestException('file is required (multipart/form-data field: file)');
    await this.service.findOne(id);
    const requestId = req.headers['x-request-id'];
    const url = await this.imageService.upload(file, 'inbound-packages', id, {
      requestId: Array.isArray(requestId) ? requestId[0] : requestId,
    });
    return this.service.addImage(id, url);
  }

  @Delete(':id/images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete image from inbound package. Requires ?imageUrl=<encoded-url>&confirm=DELETE_HARD.' })
  @ApiIdParam('id', 'Inbound package id')
  @ApiQuery({ name: 'imageUrl', required: true, type: String, description: 'Exact encoded public image URL to remove.' })
  @ApiQuery({ name: 'confirm', required: true, type: String, description: 'Must be DELETE_HARD.', example: 'DELETE_HARD' })
  @ApiResponse({ status: 200, description: 'Image deleted from storage and package imageUrls.', schema: imageMutationSchema })
  async deleteImage(
    @Param('id') id: string,
    @Query('imageUrl') imageUrl: string,
    @Query('confirm') confirm: string,
  ) {
    assertValidInboundPackageId(id);
    if (!imageUrl) throw new BadRequestException('imageUrl query param is required');
    if (confirm !== 'DELETE_HARD') {
      throw new BadRequestException('Must pass confirm=DELETE_HARD to confirm image deletion');
    }
    await this.service.findOne(id);
    await this.imageService.delete(imageUrl);
    return this.service.removeImage(id, imageUrl, confirm);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete inbound package. Requires ?confirm=DELETE_HARD. Blocked if linked to any CustomerShipmentItem.' })
  @ApiIdParam('id', 'Inbound package id')
  @ApiQuery({ name: 'confirm', required: true, type: String, description: 'Must be DELETE_HARD.', example: 'DELETE_HARD' })
  @ApiResponse({ status: 200, description: 'Inbound package hard deleted.', schema: deletedSchema })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }
}
