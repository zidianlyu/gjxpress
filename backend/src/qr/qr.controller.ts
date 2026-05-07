import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiGenericCreated, ApiGenericOk, ApiStandardResponses } from '../common/swagger/api-docs';

class GenerateQrDto {
  @ApiProperty({ description: 'Order id to generate a QR confirmation code for.' })
  @IsString()
  @IsNotEmpty()
  order_id: string;
}

class ScanQrDto {
  @ApiProperty({ description: 'QR token to scan/consume.' })
  @IsString()
  @IsNotEmpty()
  token: string;
}

@ApiTags('QR')
@ApiBearerAuth()
@ApiStandardResponses({ auth: true, forbidden: true, notFound: true })
@UseGuards(JwtAuthGuard)
@Controller('qr')
export class QrController {
  constructor(private qrService: QrService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate QR code for order delivery confirmation' })
  @ApiGenericCreated('QR code and data URL generated.')
  generate(
    @Body() dto: GenerateQrDto,
    @CurrentUser() user: any,
  ) {
    return this.qrService.generate(dto.order_id, user.id);
  }

  @Post('scan')
  @ApiOperation({ summary: 'Scan QR to confirm receipt' })
  @ApiGenericOk('QR consumed and order confirmed.')
  scan(
    @Body() dto: ScanQrDto,
    @CurrentUser() user: any,
  ) {
    return this.qrService.scan(dto.token, user.id);
  }
}
