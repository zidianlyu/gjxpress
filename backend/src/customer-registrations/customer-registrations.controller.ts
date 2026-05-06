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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CustomerRegistrationsService } from './customer-registrations.service';
import { CreateCustomerRegistrationDto } from './dto/create-customer-registration.dto';
import { UpdateCustomerRegistrationDto } from './dto/update-customer-registration.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('Admin - Customer Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/customer-registrations')
export class CustomerRegistrationsController {
  constructor(private readonly service: CustomerRegistrationsService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Manually create a customer registration (enters PENDING queue)' })
  adminCreate(@Body() dto: CreateCustomerRegistrationDto, @Req() req: Request) {
    const adminId = (req.user as any).sub;
    return this.service.adminCreate(dto, adminId);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List customer registrations with search and pagination' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
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
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update customer registration info and reviewNote (does not change status)' })
  update(@Param('id') id: string, @Body() dto: UpdateCustomerRegistrationDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Approve registration and create formal Customer (atomic transaction)' })
  approve(
    @Param('id') id: string,
    @Body('reviewNote') reviewNote?: string,
    @Req() req?: Request,
  ) {
    const adminId = (req!.user as any).sub;
    return this.service.approve(id, adminId, reviewNote);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Reject customer registration' })
  reject(
    @Param('id') id: string,
    @Body('reviewNote') reviewNote?: string,
    @Req() req?: Request,
  ) {
    const adminId = (req!.user as any).sub;
    return this.service.reject(id, adminId, reviewNote);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete registration. Requires ?confirm=DELETE_HARD. Does NOT delete any created Customer.' })
  @ApiQuery({ name: 'confirm', required: true, example: 'DELETE_HARD' })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }
}
