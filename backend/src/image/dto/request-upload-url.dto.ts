import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ImageType } from '@prisma/client';

/**
 * DTO for requesting a presigned upload URL
 * Used when integrating with Tencent COS or similar object storage
 */
export class RequestUploadUrlDto {
  @ApiProperty({
    enum: ImageType,
    description: 'Type of image being uploaded',
    example: 'OUTER',
  })
  @IsEnum(ImageType)
  @IsNotEmpty()
  image_type: ImageType;

  @ApiProperty({
    description: 'Original filename (optional, for generating proper extension)',
    example: 'package_photo.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  filename?: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
    required: false,
  })
  @IsString()
  @IsOptional()
  content_type?: string;
}

/**
 * Response DTO for upload URL request
 */
export class UploadUrlResponseDto {
  @ApiProperty({
    description: 'Presigned URL for uploading the file',
    example: 'https://gjxpress-cos.ap-guangzhou.myqcloud.com/...',
  })
  upload_url: string;

  @ApiProperty({
    description: 'Public URL where the file will be accessible after upload',
    example: 'https://gjxpress-cdn.example.com/images/...',
  })
  public_url: string;

  @ApiProperty({
    description: 'Unique identifier for this upload (used to confirm upload)',
    example: 'img_abc123def456',
  })
  upload_id: string;

  @ApiProperty({
    description: 'Expiry time of the presigned URL in seconds',
    example: 300,
  })
  expires_in: number;
}

/**
 * DTO for confirming an image upload (after file is uploaded to COS)
 */
export class ConfirmUploadDto {
  @ApiProperty({
    description: 'Upload ID received from request-upload-url response',
    example: 'img_abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  upload_id: string;

  @ApiProperty({
    enum: ImageType,
    description: 'Type of image',
    example: 'OUTER',
  })
  @IsEnum(ImageType)
  @IsNotEmpty()
  image_type: ImageType;
}

/**
 * DTO for saving image metadata (used internally or for mock uploads)
 */
export class SaveImageMetadataDto {
  @ApiProperty({
    enum: ImageType,
    description: 'Type of image',
    example: 'OUTER',
  })
  @IsEnum(ImageType)
  @IsNotEmpty()
  image_type: ImageType;

  @ApiProperty({
    description: 'Public URL of the image',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'File size in bytes (optional)',
    example: 204800,
    required: false,
  })
  @IsOptional()
  file_size?: number;

  @ApiProperty({
    description: 'Image dimensions (optional)',
    example: { width: 800, height: 600 },
    required: false,
  })
  @IsOptional()
  dimensions?: { width: number; height: number };
}
