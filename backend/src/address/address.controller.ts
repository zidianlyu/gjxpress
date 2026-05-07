import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AddressService } from './address.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiGenericOk, ApiStandardResponses } from '../common/swagger/api-docs';

@ApiTags('Address')
@ApiStandardResponses({ auth: true })
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
  @ApiGenericOk('Warehouse receiving address and copyText personalized for current user.')
  getWarehouseAddress(@CurrentUser() user: any) {
    return this.addressService.getWarehouseAddress(user?.id);
  }
}
