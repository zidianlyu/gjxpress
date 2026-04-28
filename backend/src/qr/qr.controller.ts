import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString, IsNotEmpty } from 'class-validator';

class GenerateQrDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;
}

class ScanQrDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

@ApiTags('QR')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('qr')
export class QrController {
  constructor(private qrService: QrService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate QR code for order delivery confirmation' })
  generate(
    @Body() dto: GenerateQrDto,
    @CurrentUser() user: any,
  ) {
    return this.qrService.generate(dto.order_id, user.id);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Scan QR to confirm receipt' })
  scan(
    @Body() dto: ScanQrDto,
    @CurrentUser() user: any,
  ) {
    return this.qrService.scan(dto.token, user.id);
  }
}
