import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageType } from '@prisma/client';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async addImages(
    packageId: string,
    images: { type: ImageType; url: string }[],
  ) {
    return this.prisma.packageImage.createMany({
      data: images.map((img) => ({ ...img, package_id: packageId })),
    });
  }

  async listByPackage(packageId: string) {
    return this.prisma.packageImage.findMany({
      where: { package_id: packageId },
      orderBy: { created_at: 'asc' },
    });
  }

  // TODO: Integrate Tencent COS upload – return presigned URL or uploaded COS URL
  async getUploadUrl(packageId: string, type: ImageType): Promise<string> {
    throw new Error('COS upload not yet integrated');
  }
}
