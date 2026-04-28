import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Create shipment for an order' })
  create(
    @Param('orderId') orderId: string,
    @Body() dto: CreateShipmentDto,
    @CurrentUser() user: any,
  ) {
    return this.shipmentService.create(orderId, dto, user.id);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get shipment for an order' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.shipmentService.findByOrder(orderId);
  }
}
