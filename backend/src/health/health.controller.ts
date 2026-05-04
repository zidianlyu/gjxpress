import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

interface HealthResponse {
  data: {
    status: string;
    timestamp: string;
    service: string;
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  check(): HealthResponse {
    return {
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'gjxpress-api',
      },
    };
  }
}
