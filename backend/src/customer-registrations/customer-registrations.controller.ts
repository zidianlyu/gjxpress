import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CustomerRegistrationsService } from './customer-registrations.service';
import { CreateCustomerRegistrationDto } from './dto/create-customer-registration.dto';
import { UpdateCustomerRegistrationDto } from './dto/update-customer-registration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import {
  ApiGenericCreated,
  ApiGenericOk,
  ApiIdParam,
  ApiItemsPaginatedOk,
  ApiPaginationQueries,
  ApiStandardResponses,
  deletedSchema,
} from '../common/swagger/api-docs';

@ApiTags('Admin - Customer Registrations')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true, conflict: true })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/customer-registrations')
export class CustomerRegistrationsController {
  constructor(private readonly service: CustomerRegistrationsService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Manually create a customer registration (enters PENDING queue)' })
  @ApiGenericCreated('Registration created.')
  adminCreate(@Body() dto: CreateCustomerRegistrationDto) {
    return this.service.adminCreate(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List customer registrations with search and pagination' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search phone, wechat id, address, or generated code.' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING'], description: 'Registration review status. Defaults to PENDING.' })
  @ApiPaginationQueries()
  @ApiItemsPaginatedOk('Customer registrations with pagination.')
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findAll({ q, status, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get customer registration detail' })
  @ApiIdParam('id', 'Customer registration id')
  @ApiGenericOk('Registration detail.')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update customer registration info (does not approve)' })
  @ApiIdParam('id', 'Customer registration id')
  @ApiGenericOk('Registration updated.')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerRegistrationDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Approve registration, create formal Customer, and hard delete registration (atomic transaction)' })
  @ApiIdParam('id', 'Customer registration id')
  @ApiGenericOk('Registration approved and formal customer created.')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete registration. Requires ?confirm=DELETE_HARD. Does NOT delete any created Customer.' })
  @ApiIdParam('id', 'Customer registration id')
  @ApiQuery({ name: 'confirm', required: true, type: String, description: 'Must be DELETE_HARD.', example: 'DELETE_HARD' })
  @ApiResponse({ status: 200, description: 'Registration hard deleted.', schema: deletedSchema })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }
}

@ApiTags('Customer Registrations')
@ApiStandardResponses({ conflict: true })
@Controller('customer-registrations')
export class PublicCustomerRegistrationsController {
  constructor(private readonly service: CustomerRegistrationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit new customer registration application (public, no auth)' })
  @ApiGenericCreated('Customer registration submitted; response includes generated customerCode and PENDING status.')
  submitRegistration(
    @Body() dto: CreateCustomerRegistrationDto,
    @Req() req: Request,
  ) {
    const userAgent = (req.headers['user-agent'] || '').substring(0, 512);
    return this.service.createRegistration(dto, { userAgent });
  }
}
