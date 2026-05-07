import { Controller, Get, Post, Param, Query, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PublicService } from './public.service';
import { CreateCustomerRegistrationDto } from '../customer-registrations/dto/create-customer-registration.dto';
import {
  ApiGenericCreated,
  ApiGenericOk,
  ApiPaginatedOk,
  ApiPaginationQueries,
  ApiStandardResponses,
} from '../common/swagger/api-docs';

@ApiTags('Public')
@ApiStandardResponses({ notFound: true, conflict: true })
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'List published recommendations (public, no auth)' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Category filter.' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'City filter.' })
  @ApiPaginationQueries()
  @ApiPaginatedOk('Published recommendations with pagination.')
  listRecommendations(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.publicService.listRecommendations(page, pageSize, category, city);
  }

  @Get('recommendations/:slug')
  @ApiOperation({ summary: 'Get recommendation by slug (public, no auth)' })
  @ApiParam({ name: 'slug', required: true, type: String, description: 'Recommendation slug.' })
  @ApiGenericOk('Published recommendation detail.')
  getRecommendation(@Param('slug') slug: string) {
    return this.publicService.getRecommendation(slug);
  }

  @Get('tracking/:shipmentNo')
  @ApiOperation({ summary: 'Track customer shipment by shipmentNo (public, no auth). Returns NO_RECORD if not found or tracking disabled.' })
  @ApiParam({ name: 'shipmentNo', required: true, type: String, description: 'Public customer shipment number.' })
  @ApiResponse({
    status: 200,
    description: 'Tracking result. If unavailable, status is NO_RECORD.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'NO_RECORD' },
        data: { type: 'object', nullable: true, additionalProperties: true },
      },
      additionalProperties: true,
    },
  })
  trackShipment(@Param('shipmentNo') shipmentNo: string) {
    return this.publicService.trackShipment(shipmentNo);
  }

  @Get('batch-updates/:batchNo')
  @ApiOperation({ summary: 'Get a single public batch update by batchNo (public, no auth). Only publicVisible=true batches.' })
  @ApiParam({ name: 'batchNo', required: true, type: String, description: 'Public batch/master shipment number.' })
  @ApiGenericOk('Public batch update detail.')
  getBatchUpdate(@Param('batchNo') batchNo: string) {
    return this.publicService.getBatchUpdate(batchNo);
  }

  @Get('batch-updates')
  @ApiOperation({ summary: 'List public batch (master shipment) updates (public, no auth). Only publicVisible=true batches.' })
  @ApiPaginationQueries()
  @ApiPaginatedOk('Public batch updates with pagination.')
  listBatchUpdates(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.publicService.listBatchUpdates({ page, pageSize });
  }

  @Post('customer-registrations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit new customer registration application (public, no auth). Returns customerCode and PENDING status only.' })
  @ApiGenericCreated('Customer registration submitted; response includes generated customerCode and PENDING status.')
  submitRegistration(
    @Body() dto: CreateCustomerRegistrationDto,
    @Req() req: Request,
  ) {
    const userAgent = (req.headers['user-agent'] || '').substring(0, 512);
    return this.publicService.submitRegistration(dto, { userAgent });
  }
}
