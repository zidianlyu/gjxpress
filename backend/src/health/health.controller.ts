import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint with database and storage status' })
  @ApiResponse({
    status: 200,
    description: 'Service health including database and storage checks.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'degraded'] },
        timestamp: { type: 'string', format: 'date-time' },
        service: { type: 'string', example: 'gjxpress-api' },
        database: { type: 'string', enum: ['ok', 'error'] },
        databaseError: { type: 'string', nullable: true },
        storage: { type: 'string', enum: ['ok', 'error'] },
        storageError: { type: 'string', nullable: true },
      },
      required: ['status', 'timestamp', 'service', 'database', 'storage'],
    },
  })
  async check() {
    const timestamp = new Date().toISOString();

    // Database check
    let database = 'ok';
    let databaseError: string | undefined;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      database = 'error';
      databaseError = String(e);
    }

    // Storage check
    let storage = 'ok';
    let storageError: string | undefined;
    const storageResult = await this.storage.healthCheck();
    if (!storageResult.ok) {
      storage = 'error';
      storageError = storageResult.error;
    }

    const status = database === 'ok' && storage === 'ok' ? 'ok' : 'degraded';

    return {
      status,
      timestamp,
      service: 'gjxpress-api',
      database,
      ...(databaseError && { databaseError }),
      storage,
      ...(storageError && { storageError }),
    };
  }
}
