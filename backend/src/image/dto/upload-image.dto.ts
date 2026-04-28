import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ImageType } from '@prisma/client';

export class ImageItemDto {
  @ApiProperty({ enum: ImageType })
  @IsEnum(ImageType)
  type: ImageType;

  @ApiProperty({ description: 'COS URL of the uploaded image' })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UploadImagesDto {
  @ApiProperty({ type: [ImageItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageItemDto)
  images: ImageItemDto[];
}
