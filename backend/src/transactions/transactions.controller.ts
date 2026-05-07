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
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsPositive, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import {
  ApiGenericCreated,
  ApiGenericOk,
  ApiIdParam,
  ApiPaginatedOk,
  ApiPaginationQueries,
  ApiStandardResponses,
  deletedSchema,
} from '../common/swagger/api-docs';

class CreateTransactionDto {
  @ApiProperty({ format: 'uuid', description: 'Customer shipment id.' })
  @IsUUID() customerShipmentId: string;
  @ApiProperty({ enum: ['SHIPPING_FEE', 'REFUND'], description: 'Transaction type.' })
  @IsIn(['SHIPPING_FEE', 'REFUND']) type: string;
  @ApiProperty({ type: Number, description: 'Amount in cents.' })
  @IsInt() @IsPositive() @Type(() => Number) amountCents: number;
  @ApiPropertyOptional({ description: 'Admin note.' })
  @IsString() @IsOptional() adminNote?: string;
}

class UpdateTransactionDto {
  @ApiPropertyOptional({ enum: ['SHIPPING_FEE', 'REFUND'], description: 'Transaction type.' })
  @IsIn(['SHIPPING_FEE', 'REFUND']) @IsOptional() type?: string;
  @ApiPropertyOptional({ type: Number, description: 'Amount in cents.' })
  @IsInt() @IsPositive() @IsOptional() @Type(() => Number) amountCents?: number;
  @ApiPropertyOptional({ description: 'Admin note.' })
  @IsString() @IsOptional() adminNote?: string;
  @ApiPropertyOptional({ format: 'date-time', description: 'Transaction occurrence timestamp.' })
  @IsString() @IsOptional() occurredAt?: string;
}

@ApiTags('Admin - Transactions')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true, conflict: true })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create transaction record. customerId is derived from customerShipmentId.' })
  @ApiGenericCreated('Transaction record created.')
  create(@Body() dto: CreateTransactionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List transaction records' })
  @ApiQuery({ name: 'customerId', required: false, type: String, description: 'Customer id filter.' })
  @ApiQuery({ name: 'customerShipmentId', required: false, type: String, description: 'Customer shipment id filter.' })
  @ApiQuery({ name: 'type', required: false, enum: ['SHIPPING_FEE', 'REFUND'], description: 'Transaction type filter.' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search customer code, shipment number, or note.' })
  @ApiPaginationQueries()
  @ApiPaginatedOk('Transaction records with pagination.')
  findAll(
    @Query('customerId') customerId?: string,
    @Query('customerShipmentId') customerShipmentId?: string,
    @Query('type') type?: string,
    @Query('q') q?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.findAll({ customerId, customerShipmentId, type, q, page, pageSize });
  }

  @Get(':id')
  @ApiOperation({ summary: '[Admin] Get transaction record detail' })
  @ApiIdParam('id', 'Transaction record id')
  @ApiGenericOk('Transaction record detail.')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update transaction record (type, amountCents, adminNote, occurredAt)' })
  @ApiIdParam('id', 'Transaction record id')
  @ApiGenericOk('Transaction record updated.')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete transaction. Requires ?confirm=DELETE_HARD.' })
  @ApiIdParam('id', 'Transaction record id')
  @ApiQuery({ name: 'confirm', required: true, type: String, description: 'Must be DELETE_HARD.', example: 'DELETE_HARD' })
  @ApiResponse({ status: 200, description: 'Transaction hard deleted.', schema: deletedSchema })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }
}
