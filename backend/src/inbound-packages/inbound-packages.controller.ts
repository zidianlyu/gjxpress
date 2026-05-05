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
import { IsString, IsOptional } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { InboundPackagesService } from './inbound-packages.service';
import { CreateInboundPackageDto } from './dto/create-inbound-package.dto';
import { AdminImageService } from '../admin-image/admin-image.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

class UpdateInboundPackageDto {
  @IsString() @IsOptional() domesticTrackingNo?: string;
  @IsString() @IsOptional() warehouseReceivedAt?: string;
  @IsString() @IsOptional() issueNote?: string;
  @IsString() @IsOptional() adminNote?: string;
  @IsString() @IsOptional() status?: string;
}

class AssignCustomerDto {
  @IsString() customerCode: string;
}

class UpdateStatusDto {
  @IsString() status: string;
}


@ApiTags('Admin - InboundPackages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/inbound-packages')
export class InboundPackagesController {
  constructor(
    private readonly service: InboundPackagesService,
    private readonly imageService: AdminImageService,
  ) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create inbound package' })
  create(@Body() dto: CreateInboundPackageDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List inbound packages' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findAll({ q, status, customerId, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get inbound package detail' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] General update for inbound package (domesticTrackingNo, warehouseReceivedAt, issueNote, adminNote, status)' })
  update(@Param('id') id: string, @Body() dto: UpdateInboundPackageDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/assign-customer')
  @ApiOperation({ summary: '[Admin] Assign customer to unclaimed package' })
  assignCustomer(@Param('id') id: string, @Body() dto: AssignCustomerDto) {
    return this.service.assignCustomer(id, dto.customerCode);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '[Admin] Update inbound package status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }

  @Get(':id/images')
  @ApiOperation({ summary: '[Admin] Get image list for inbound package' })
  getImages(@Param('id') id: string) {
    return this.service.getImages(id);
  }

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Admin] Upload image for inbound package. Stores in Supabase Storage and appends public URL to imageUrls.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('file is required (multipart/form-data field: file)');
    const url = await this.imageService.upload(file, 'inbound-packages', id);
    return this.service.addImage(id, url);
  }

  @Delete(':id/images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Delete image from inbound package. Requires ?imageUrl=<encoded-url>&confirm=DELETE_HARD.' })
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
  @ApiOperation({ summary: '[Admin] Hard delete inbound package. Requires ?confirm=DELETE_HARD. Blocked if linked to any CustomerShipmentItem.' })
  @ApiQuery({ name: 'confirm', required: true, example: 'DELETE_HARD' })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }
}
