import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';

@ApiTags('Public Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('batch-updates')
  @ApiOperation({ summary: 'List recent master shipment batch updates (public, no auth).' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Default 10, max 50.' })
  listBatchUpdates(@Query('limit') limit?: number) {
    return this.trackingService.listBatchUpdates(limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search public tracking by shipmentNo, customerCode, domestic or international tracking number.' })
  @ApiQuery({ name: 'q', required: true, type: String })
  search(@Query('q') q?: string) {
    return this.trackingService.search(q);
  }

  @Get()
  @ApiOperation({ summary: 'Search public tracking by q query parameter.' })
  @ApiQuery({ name: 'q', required: true, type: String })
  searchByQuery(@Query('q') q?: string) {
    return this.trackingService.search(q);
  }

  @Get(':shipmentNo')
  @ApiOperation({ summary: 'Track a customer shipment by shipmentNo (public, no auth).' })
  @ApiParam({ name: 'shipmentNo', required: true, type: String })
  trackShipment(@Param('shipmentNo') shipmentNo: string) {
    return this.trackingService.search(shipmentNo);
  }
}
