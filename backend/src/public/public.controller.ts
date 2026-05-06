import { Controller, Get, Post, Param, Query, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PublicService } from './public.service';
import { CreateCustomerRegistrationDto } from '../customer-registrations/dto/create-customer-registration.dto';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'List published recommendations (public, no auth)' })
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
  getRecommendation(@Param('slug') slug: string) {
    return this.publicService.getRecommendation(slug);
  }

  @Get('tracking/:shipmentNo')
  @ApiOperation({ summary: 'Track customer shipment by shipmentNo (public, no auth). Returns NO_RECORD if not found or tracking disabled.' })
  trackShipment(@Param('shipmentNo') shipmentNo: string) {
    return this.publicService.trackShipment(shipmentNo);
  }

  @Get('batch-updates/:batchNo')
  @ApiOperation({ summary: 'Get a single public batch update by batchNo (public, no auth). Only publicVisible=true batches.' })
  getBatchUpdate(@Param('batchNo') batchNo: string) {
    return this.publicService.getBatchUpdate(batchNo);
  }

  @Get('batch-updates')
  @ApiOperation({ summary: 'List public batch (master shipment) updates (public, no auth). Only publicVisible=true batches.' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  listBatchUpdates(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.publicService.listBatchUpdates({ page, pageSize });
  }

  @Post('customer-registrations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit new customer registration application (public, no auth). Returns customerCode and PENDING status only.' })
  submitRegistration(
    @Body() dto: CreateCustomerRegistrationDto,
    @Req() req: Request,
  ) {
    const userAgent = (req.headers['user-agent'] || '').substring(0, 512);
    return this.publicService.submitRegistration(dto, { userAgent });
  }
}
