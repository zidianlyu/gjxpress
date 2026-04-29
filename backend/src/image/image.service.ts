import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageType } from '@prisma/client';

/**
 * Interface for upload URL response
 * Prepared for Tencent COS integration
 */
export interface UploadUrlResponse {
  upload_url: string;
  public_url: string;
  upload_id: string;
  expires_in: number;
}

/**
 * Interface for image metadata
 */
export interface ImageMetadata {
  type: ImageType;
  url: string;
  file_size?: number;
  width?: number;
  height?: number;
}

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  /**
   * Add multiple images to a package (batch save)
   * Used when images are already uploaded (e.g., mock URLs or after COS upload)
   */
  async addImages(
    packageId: string,
    images: { type: ImageType; url: string }[],
  ) {
    return this.prisma.packageImage.createMany({
      data: images.map((img) => ({ ...img, package_id: packageId })),
    });
  }

  /**
   * Save single image metadata to database
   * This is the final step after image is uploaded to storage
   */
  async saveImageMetadata(
    packageId: string,
    metadata: ImageMetadata,
  ) {
    return this.prisma.packageImage.create({
      data: {
        package_id: packageId,
        type: metadata.type,
        url: metadata.url,
      },
    });
  }

  /**
   * List all images for a package
   */
  async listByPackage(packageId: string) {
    return this.prisma.packageImage.findMany({
      where: { package_id: packageId },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Get upload URL for a new image
   * ============================================================================
   * TODO: Integrate Tencent COS for production
   * ---------------------------------------------------------------------------
   * For now, returns mock response for development/testing.
   *
   * Future COS integration should:
   * 1. Generate unique object key: `${packageId}/${imageType}_${timestamp}.jpg`
   * 2. Call COS API to create presigned upload URL
   * 3. Return presigned URL + public URL + upload ID
   * 4. Store upload_id in temporary cache (Redis) for later confirmation
   * ---------------------------------------------------------------------------
   */
  async createUploadUrl(
    packageId: string,
    imageType: ImageType,
    filename?: string,
  ): Promise<UploadUrlResponse> {
    // Mock implementation for development
    const uploadId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ext = filename ? filename.split('.').pop() : 'jpg';
    const mockPublicUrl = `https://via.placeholder.com/400x300/f0f0f0/666?text=${imageType}_${uploadId.slice(0, 8)}`;

    return {
      upload_url: mockPublicUrl, // In real implementation, this would be COS presigned URL
      public_url: mockPublicUrl,
      upload_id: uploadId,
      expires_in: 300, // 5 minutes
    };
  }

  /**
   * Confirm image upload after file is uploaded to storage
   * ============================================================================
   * TODO: Implement when integrating Tencent COS
   * ---------------------------------------------------------------------------
   * 1. Verify upload_id from cache/Redis
   * 2. Check if file exists in COS bucket
   * 3. Get file metadata (size, dimensions)
   * 4. Save metadata to database via saveImageMetadata()
   * 5. Clear upload_id from cache
   * ---------------------------------------------------------------------------
   */
  async confirmUpload(
    packageId: string,
    uploadId: string,
    imageType: ImageType,
  ) {
    // Mock implementation: directly save with mock URL
    const mockUrl = `https://via.placeholder.com/400x300/f0f0f0/666?text=${imageType}_${uploadId.slice(0, 8)}`;

    return this.saveImageMetadata(packageId, {
      type: imageType,
      url: mockUrl,
    });
  }

  /**
   * Delete an image (both from DB and storage)
   * ============================================================================
   * TODO: Implement COS deletion when integrating
   * ---------------------------------------------------------------------------
   * 1. Get image URL from database
   * 2. Delete from COS bucket
   * 3. Delete from database
   * ---------------------------------------------------------------------------
   */
  async deleteImage(imageId: string) {
    // For now, only delete from database
    return this.prisma.packageImage.delete({
      where: { id: imageId },
    });
  }

  // Legacy method - kept for backward compatibility
  async getUploadUrl(packageId: string, type: ImageType): Promise<string> {
    const response = await this.createUploadUrl(packageId, type);
    return response.upload_url;
  }
}
