import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { ImageType, ImageStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface SignedUploadUrlResponse {
  uploadUrl: string;
  storagePath: string;
  token: string;
  expiresIn: number;
}

export interface SignedReadUrlResponse {
  signedUrl: string;
  expiresIn: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: SupabaseClient | null = null;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucketName = this.configService.get<string>('SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES') || 'gjxpress-storage';

    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
    } else {
      this.logger.warn('Supabase storage not configured. Image uploads will use mock mode.');
    }
  }

  /**
   * Create a signed upload URL for a package image.
   * The client uploads directly to Supabase Storage, then calls savePackageImageMetadata.
   */
  async createPackageImageUploadUrl(
    packageId: string,
    imageType: ImageType,
    filename: string,
  ): Promise<SignedUploadUrlResponse> {
    if (!this.supabase) {
      throw new Error('Supabase storage not configured');
    }

    const ext = this.getExtension(filename);
    const storagePath = `packages/${packageId}/${imageType.toLowerCase()}/${uuidv4()}.${ext}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
      this.logger.error('Failed to create signed upload URL:', error);
      throw new Error(`Failed to create upload URL: ${error?.message}`);
    }

    return {
      uploadUrl: data.signedUrl,
      storagePath,
      token: data.token,
      expiresIn: 7200,
    };
  }

  /**
   * Save image metadata to PackageImage table after successful upload.
   */
  async savePackageImageMetadata(
    packageId: string,
    imageType: ImageType,
    storagePath: string,
    uploadedByAdminId?: string,
  ) {
    return this.prisma.packageImage.create({
      data: {
        packageId,
        imageType,
        bucket: this.bucketName,
        storagePath,
        status: ImageStatus.UPLOADED,
        uploadedByAdminId,
        uploadedAt: new Date(),
      },
    });
  }

  /**
   * Get a signed read URL for a private image.
   */
  async getPackageImageSignedUrl(imageId: string): Promise<SignedReadUrlResponse> {
    if (!this.supabase) {
      throw new Error('Supabase storage not configured');
    }

    const image = await this.prisma.packageImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    const expiresIn = 3600;
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(image.storagePath, expiresIn);

    if (error || !data) {
      this.logger.error('Failed to create signed read URL:', error);
      throw new Error(`Failed to create read URL: ${error?.message}`);
    }

    return {
      signedUrl: data.signedUrl,
      expiresIn,
    };
  }

  /**
   * Get public URL (only works if bucket is set to public).
   */
  getPublicUrl(storagePath: string): string {
    if (!this.supabase) {
      return '';
    }
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(storagePath);
    return data.publicUrl;
  }

  /**
   * Delete a file from storage and soft-delete the DB record.
   */
  async deleteFile(imageId: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase storage not configured');
    }

    const image = await this.prisma.packageImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error('Image not found');
    }

    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([image.storagePath]);

    if (error) {
      this.logger.error('Failed to delete file from storage:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    await this.prisma.packageImage.update({
      where: { id: imageId },
      data: { status: ImageStatus.DELETED, deletedAt: new Date() },
    });
  }

  /**
   * Check if Supabase storage is reachable.
   */
  async healthCheck(): Promise<{ ok: boolean; error?: string }> {
    if (!this.supabase) {
      return { ok: false, error: 'Supabase storage not configured' };
    }
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .list('', { limit: 1 });
      if (error) {
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  /**
   * Check if storage is configured
   */
  isConfigured(): boolean {
    return !!this.supabase;
  }

  private getExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : 'jpg';
  }
}
