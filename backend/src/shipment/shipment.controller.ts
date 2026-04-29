import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Shipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shipments')
export class ShipmentController {
  constructor(private shipmentService: ShipmentService) {}

  @Post(':orderId')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: '[Admin] Create shipment for an order',
    description: `Create shipment for an order. By default, order must be paid.
    Use force=true to override (for special cases like COD or trust-based shipping).`,
  })
  @ApiQuery({
    name: 'force',
    required: false,
    type: Boolean,
    description: 'Force shipment even if order is not paid (admin override)',
  })
  create(
    @Param('orderId') orderId: string,
    @Body() dto: CreateShipmentDto,
    @Query('force') force: boolean = false,
    @CurrentUser() user: any,
  ) {
    return this.shipmentService.create(orderId, dto, user.id, force);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get shipment for an order' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.shipmentService.findByOrder(orderId);
  }
}
