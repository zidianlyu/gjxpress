import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders for current user' })
  findAll(@CurrentUser() user: any) {
    return this.orderService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order detail' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.orderService.findOneByUser(id, user.id);
  }
}
