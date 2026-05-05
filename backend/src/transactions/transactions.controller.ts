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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

class CreateTransactionDto {
  @IsUUID() customerId: string;
  @IsUUID() customerShipmentId: string;
  @IsString() @IsOptional() type?: string;
  @IsInt() @IsPositive() @Type(() => Number) amountCents: number;
  @IsString() @IsOptional() adminNote?: string;
  @IsString() @IsOptional() occurredAt?: string;
}

class UpdateTransactionDto {
  @IsString() @IsOptional() type?: string;
  @IsInt() @IsOptional() @Type(() => Number) amountCents?: number;
  @IsString() @IsOptional() adminNote?: string;
  @IsString() @IsOptional() occurredAt?: string;
}

@ApiTags('Admin - Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: '[Admin] Create transaction record' })
  create(@Body() dto: CreateTransactionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: '[Admin] List transaction records' })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'customerShipmentId', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ['SHIPPING_FEE', 'REFUND'] })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
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
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[Admin] Update transaction record (type, amountCents, adminNote, occurredAt)' })
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Hard delete transaction. Requires ?confirm=DELETE_HARD. Blocked if paymentStatus=PAID.' })
  hardDelete(@Param('id') id: string, @Query('confirm') confirm: string) {
    return this.service.hardDelete(id, confirm);
  }
}
