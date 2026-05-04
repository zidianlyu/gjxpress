import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SignedUploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
  path: string;
  token: string;
  expiresIn: number;
}

interface SignedReadUrlResponse {
  url: string;
  expiresIn: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly supabaseUrl: string;
  private readonly supabaseServiceKey: string;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || '';
    this.supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '';
    this.bucketName = this.configService.get<string>('SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES') || 'package-images';

    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      this.logger.warn('Supabase storage not configured. Image uploads will fail.');
    }
  }

  /**
   * Generate a signed upload URL for direct browser upload to Supabase Storage
   * The client uploads directly to Supabase, then confirms with backend
   */
  async createSignedUploadUrl(
    packageId: string,
    imageType: string,
    fileName: string,
    contentType: string,
  ): Promise<SignedUploadUrlResponse> {
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Supabase storage not configured');
    }

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uuid = this.generateUUID();
    const ext = this.getExtension(fileName);
    const path = `packages/${packageId}/${imageType}/${timestamp}_${uuid}.${ext}`;

    try {
      // Call Supabase Storage API to create signed upload URL
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/sign/${this.bucketName}/${path}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expiresIn: 7200, // 2 hours
          }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create signed URL: ${error}`);
      }

      const data = await response.json();
      
      return {
        uploadUrl: `${this.supabaseUrl}/storage/v1${data.signedURL}`,
        storageKey: path,
        path,
        token: data.token,
        expiresIn: 7200,
      };
    } catch (error) {
      this.logger.error('Failed to create signed upload URL:', error);
      throw new Error('Failed to create upload URL');
    }
  }

  /**
   * Create a signed URL for reading a private file
   */
  async createSignedReadUrl(storagePath: string, expiresInSeconds = 3600): Promise<SignedReadUrlResponse> {
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Supabase storage not configured');
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/sign/${this.bucketName}/${storagePath}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expiresIn: expiresInSeconds,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to create signed read URL: ${await response.text()}`);
      }

      const data = await response.json();

      return {
        url: `${this.supabaseUrl}/storage/v1${data.signedURL}`,
        expiresIn: expiresInSeconds,
      };
    } catch (error) {
      this.logger.error('Failed to create signed read URL:', error);
      throw new Error('Failed to create read URL');
    }
  }

  /**
   * Get public URL for a file (only works if bucket is public)
   */
  getPublicUrl(storagePath: string): string {
    return `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${storagePath}`;
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(storagePath: string): Promise<void> {
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Supabase storage not configured');
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${storagePath}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.supabaseServiceKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${await response.text()}`);
      }
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Check if storage is configured
   */
  isConfigured(): boolean {
    return !!(this.supabaseUrl && this.supabaseServiceKey);
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private getExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1]!.toLowerCase() : 'jpg';
  }
}
