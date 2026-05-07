import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiGenericOk, ApiIdParam, ApiStandardResponses } from '../common/swagger/api-docs';

@ApiTags('Order')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true })
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders for current user' })
  @ApiGenericOk('Order array for current user.')
  findAll(@CurrentUser() user: any) {
    return this.orderService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order detail' })
  @ApiIdParam('id', 'Order id')
  @ApiGenericOk('Order detail for current user.')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.orderService.findOneByUser(id, user.id);
  }

  @Get(':id/shipment')
  @ApiOperation({ summary: 'Get shipment info for an order' })
  @ApiIdParam('id', 'Order id')
  @ApiGenericOk('Shipment envelope; data is nullable when no shipment exists.')
  getShipment(@Param('id') id: string, @CurrentUser() user: any) {
    return this.orderService.getShipmentByOrder(id, user.id);
  }
}
