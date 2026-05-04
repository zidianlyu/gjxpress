import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Address')
@Controller('warehouse-address')
export class AddressController {
  constructor(
    private addressService: AddressService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get warehouse receiving address with user-specific copyText' })
  getWarehouseAddress(@CurrentUser() user: any) {
    return this.addressService.getWarehouseAddress(user?.id);
  }
}
