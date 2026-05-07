import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

@Injectable()
export class AdminImageService {
  private readonly logger = new Logger(AdminImageService.name);
  private supabase: SupabaseClient;
  private bucket: string;
  private readonly bucketEnvName = 'SUPABASE_STORAGE_BUCKET_PACKAGE_IMAGES';

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) {
      throw new InternalServerErrorException('Supabase credentials not configured');
    }
    this.supabase = createClient(url, key, { auth: { persistSession: false } });
    const bucket = this.config.get<string>(this.bucketEnvName)?.trim();
    if (!bucket) {
      throw new InternalServerErrorException(
        `Missing required env ${this.bucketEnvName}`,
      );
    }
    this.bucket = bucket;
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
    const ext = safeName.split('.').pop() || 'jpg';
    const path = `${folder}/${resourceId}/${randomUUID()}-${safeName}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(
        `Storage upload failed bucket=${this.bucket} env=${this.bucketEnvName} requestId=${context?.requestId ?? 'n/a'} code=${(error as any).statusCode ?? (error as any).code ?? 'n/a'} message=${error.message}`,
      );
      throw new InternalServerErrorException(
        `Storage upload failed for bucket ${this.bucket} (${this.bucketEnvName}): ${error.message}`,
      );
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async delete(publicUrl: string): Promise<void> {
    const path = this.extractPath(publicUrl);
    if (!path) {
      throw new BadRequestException('Cannot parse storage path from the provided imageUrl');
    }

    const { error } = await this.supabase.storage.from(this.bucket).remove([path]);
    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('not found') || msg.includes('does not exist') || msg.includes('no such')) {
        this.logger.warn(`Storage object not found during delete (already removed?): ${path}`);
        return;
      }
      throw new InternalServerErrorException(`Storage delete failed: ${error.message}`);
    }
  }

  private extractPath(publicUrl: string): string | null {
    try {
      const url = new URL(publicUrl);
      const marker = `/object/public/${this.bucket}/`;
      const idx = url.pathname.indexOf(marker);
      if (idx === -1) return null;
      return url.pathname.slice(idx + marker.length);
    } catch {
      return null;
    }
  }
}
