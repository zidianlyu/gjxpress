import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('orders/:orderId/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Patch('status')
  @ApiOperation({ summary: '[Admin] Update order payment status' })
  update(
    @Param('orderId') orderId: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.updateStatus(orderId, dto, user.id);
  }
}
