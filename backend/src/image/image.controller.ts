import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { UploadImagesDto } from './dto/upload-image.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('Image')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('packages/:packageId/images')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Attach images to a package' })
  upload(@Param('packageId') packageId: string, @Body() dto: UploadImagesDto) {
    return this.imageService.addImages(packageId, dto.images);
  }

  @Get()
  @ApiOperation({ summary: 'List images for a package' })
  list(@Param('packageId') packageId: string) {
    return this.imageService.listByPackage(packageId);
  }
}
