import { Controller, Post, Get, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { UploadImagesDto } from './dto/upload-image.dto';
import { RequestUploadUrlDto, ConfirmUploadDto } from './dto/request-upload-url.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { ApiGenericCreated, ApiGenericOk, ApiIdParam, ApiStandardResponses } from '../common/swagger/api-docs';

@ApiTags('Image')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true })
@UseGuards(JwtAuthGuard)
@Controller('packages/:packageId/images')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post('request-upload-url')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: '[Admin] Request presigned upload URL (for COS integration)',
    description: 'Step 1: Get upload URL. Step 2: Upload file. Step 3: Call confirm-upload',
  })
  @ApiIdParam('packageId', 'Package id')
  @ApiGenericCreated('Presigned upload URL payload.')
  requestUploadUrl(
    @Param('packageId') packageId: string,
    @Body() dto: RequestUploadUrlDto,
  ) {
    return this.imageService.createUploadUrl(packageId, dto.image_type, dto.filename);
  }

  @Post('confirm-upload')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: '[Admin] Confirm image upload and save metadata',
    description: 'Save image metadata after file is uploaded to storage',
  })
  @ApiIdParam('packageId', 'Package id')
  @ApiGenericCreated('Image metadata saved.')
  confirmUpload(
    @Param('packageId') packageId: string,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.imageService.confirmUpload(packageId, dto.upload_id, dto.image_type);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Attach images to a package (batch)' })
  @ApiIdParam('packageId', 'Package id')
  @ApiGenericCreated('Images attached to package.')
  upload(@Param('packageId') packageId: string, @Body() dto: UploadImagesDto) {
    return this.imageService.addImages(packageId, dto.images);
  }

  @Get()
  @ApiOperation({ summary: 'List images for a package' })
  @ApiIdParam('packageId', 'Package id')
  @ApiGenericOk('Package image array.')
  list(@Param('packageId') packageId: string) {
    return this.imageService.listByPackage(packageId);
  }

  @Delete(':imageId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Delete an image' })
  @ApiIdParam('packageId', 'Package id')
  @ApiIdParam('imageId', 'Image id')
  @ApiGenericOk('Image deleted.')
  delete(@Param('imageId') imageId: string) {
    return this.imageService.deleteImage(imageId);
  }
}
