import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
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

@ApiTags('Admin - Customers')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true, conflict: true })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create customer with auto-generated customerCode' })
  @ApiGenericCreated('Customer created.')
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List customers with search and pagination' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search customer code, phone, wechat id, address, or notes.' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Customer status filter.' })
  @ApiPaginationQueries()
  @ApiItemsPaginatedOk('Customers with inboundPackageCount and customerShipmentCount plus pagination.')
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.customersService.findAll({ q, status, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get customer detail with packages and shipments' })
  @ApiIdParam('id', 'Customer id')
  @ApiGenericOk('Customer detail with packages, shipments, and counts.')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update customer info (phone, wechatId, notes, status)' })
  @ApiIdParam('id', 'Customer id')
  @ApiGenericOk('Customer updated.')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Patch(':id/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Soft-disable customer (sets status=DISABLED).' })
  @ApiIdParam('id', 'Customer id')
  @ApiGenericOk('Customer disabled.')
  disable(@Param('id') id: string) {
    return this.customersService.disable(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete customer. Requires ?confirm=DELETE_HARD. Blocked if any inboundPackages, customerShipments, or transactions exist.' })
  @ApiIdParam('id', 'Customer id')
  @ApiQuery({ name: 'confirm', required: true, type: String, description: 'Must be DELETE_HARD.', example: 'DELETE_HARD' })
  @ApiResponse({ status: 200, description: 'Customer hard deleted.', schema: deletedSchema })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.customersService.hardDelete(id, confirm);
  }
}
