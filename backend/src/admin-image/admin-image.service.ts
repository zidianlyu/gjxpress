import { Injectable, BadRequestException, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

@Injectable()
export class AdminImageService implements OnModuleInit {
  private readonly logger = new Logger(AdminImageService.name);
  private supabase: SupabaseClient;
  private bucket: string;
  private readonly bucketEnvName = 'SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES';
  private readonly supabaseUrl: string;

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL')?.trim();
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) {
      throw new InternalServerErrorException('Supabase credentials not configured');
    }
    this.supabaseUrl = url;
    this.supabase = createClient(url, key, { auth: { persistSession: false } });
    const bucket = this.config.get<string>(this.bucketEnvName)?.trim();
    if (!bucket) {
      throw new InternalServerErrorException(
        `Missing required env ${this.bucketEnvName}`,
      );
    }
    this.bucket = bucket;
  }

  onModuleInit() {
    const urlInfo = this.describeSupabaseUrl(this.supabaseUrl);
    this.logger.log(
      `Admin image storage configured env=${this.bucketEnvName} bucket=${this.bucket} supabaseHost=${urlInfo.host} projectRef=${urlInfo.projectRef} keySource=SUPABASE_SERVICE_ROLE_KEY`,
    );
  }

  async upload(
    file: Express.Multer.File,
    folder: 'inbound-packages' | 'customer-shipments',
    resourceId: string,
    context?: { requestId?: string },
  ): Promise<string> {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME.join(', ')}`,
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max allowed: 10 MB`,
      );
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const path = `${folder}/${resourceId}/${randomUUID()}-${safeName}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(
        `Storage upload failed env=${this.bucketEnvName} bucket=${this.bucket} objectPath=${path} requestId=${context?.requestId ?? 'n/a'} statusCode=${(error as any).statusCode ?? 'n/a'} code=${(error as any).code ?? 'n/a'} message=${error.message}`,
      );
      throw new InternalServerErrorException(
        `Storage upload failed: ${error.message}`,
      );
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(publicUrl: string): Promise<void> {
    const path = this.extractObjectPathFromPublicUrl(publicUrl, this.bucket);
    if (!path) {
      throw new BadRequestException('Cannot parse storage path from the provided imageUrl');
    }

    await this.removeObjectsByPaths([path]);
  }

  async removeByPublicUrls(imageUrls: string[] | null | undefined): Promise<number> {
    const urls = (imageUrls ?? []).filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
    if (urls.length === 0) return 0;

    const objectPaths: string[] = [];
    for (const imageUrl of urls) {
      const path = this.extractObjectPathFromPublicUrl(imageUrl, this.bucket);
      if (path) {
        objectPaths.push(path);
        continue;
      }

      if (this.isSupabaseStorageUrl(imageUrl)) {
        this.logger.error(
          `Storage URL parse failed env=${this.bucketEnvName} bucket=${this.bucket} objectCount=1`,
        );
        throw new BadRequestException('Cannot parse Supabase Storage URL for the configured bucket');
      }

      this.logger.warn(
        `Skipping non-Supabase storage image reference env=${this.bucketEnvName} bucket=${this.bucket} objectCount=1`,
      );
    }

    const uniquePaths = [...new Set(objectPaths)];
    await this.removeObjectsByPaths(uniquePaths);
    return uniquePaths.length;
  }

  extractObjectPathFromPublicUrl(imageUrl: string, bucketName: string): string | null {
    const value = imageUrl.trim();
    const bucket = bucketName.trim();
    if (!value || !bucket) return null;

    if (!this.looksLikeUrl(value)) {
      return this.normalizeObjectPath(value, bucket);
    }

    try {
      const url = new URL(value);
      const marker = `/object/public/${bucket}/`;
      const idx = url.pathname.indexOf(marker);
      if (idx === -1) return null;
      const rawPath = url.pathname.slice(idx + marker.length);
      return this.normalizeObjectPath(decodeURIComponent(rawPath), bucket);
    } catch {
      return null;
    }
  }

  async removeObjectsByUrls(imageUrls: string[]): Promise<number> {
    return this.removeByPublicUrls(imageUrls);
  }

  private async removeObjectsByPaths(paths: string[]): Promise<void> {
    const objectPaths = [...new Set(paths.map((path) => path.trim()).filter(Boolean))];
    if (objectPaths.length === 0) return;

    this.logger.log(
      `Removing storage objects env=${this.bucketEnvName} bucket=${this.bucket} objectPrefix=${this.describeObjectPrefix(objectPaths)} objectCount=${objectPaths.length}`,
    );

    const { data, error } = await this.supabase.storage.from(this.bucket).remove(objectPaths);
    if (error) {
      this.logger.error(
        `Storage delete failed env=${this.bucketEnvName} bucket=${this.bucket} objectPrefix=${this.describeObjectPrefix(objectPaths)} objectCount=${objectPaths.length} statusCode=${(error as any).statusCode ?? 'n/a'} code=${(error as any).code ?? 'n/a'} message=${error.message}`,
      );
      throw new InternalServerErrorException(`Storage delete failed: ${error.message}`);
    }
    if (Array.isArray(data) && data.length < objectPaths.length) {
      this.logger.warn(
        `Some storage objects were already absent env=${this.bucketEnvName} bucket=${this.bucket} objectPrefix=${this.describeObjectPrefix(objectPaths)} objectCount=${objectPaths.length}`,
      );
    }
  }

  private describeSupabaseUrl(rawUrl: string): { host: string; projectRef: string } {
    try {
      const url = new URL(rawUrl);
      const host = url.host;
      return {
        host,
        projectRef: host.endsWith('.supabase.co') ? host.split('.')[0] : 'n/a',
      };
    } catch {
      return { host: 'invalid-url', projectRef: 'n/a' };
    }
  }

  private looksLikeUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
  }

  private isSupabaseStorageUrl(value: string): boolean {
    if (!this.looksLikeUrl(value)) return false;
    try {
      const url = new URL(value);
      return url.hostname.endsWith('.supabase.co') && url.pathname.includes('/storage/v1/object/');
    } catch {
      return false;
    }
  }

  private normalizeObjectPath(rawPath: string, bucketName: string): string | null {
    const path = rawPath.replace(/^\/+/, '');
    if (!path || path.includes('..')) return null;
    if (path === bucketName || path.startsWith(`${bucketName}/`)) return null;
    return path;
  }

  private describeObjectPrefix(paths: string[]): string {
    const first = paths[0] ?? '';
    return first.split('/').slice(0, 2).join('/') || 'n/a';
  }
}
