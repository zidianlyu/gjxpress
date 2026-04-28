import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Address')
@Controller('address')
export class AddressController {
  private readonly warehouseAddress = {
    name: '广骏国内仓库',
    recipient: '广骏集运',
    phone: '13800138000',
    province: '广东省',
    city: '广州市',
    district: '白云区',
    address: '白云大道123号物流园A区',
    zip_code: '510000',
    full_text:
      '广骏集运 13800138000\n广东省广州市白云区白云大道123号物流园A区\n邮编：510000',
  };

  @Get('warehouse')
  @ApiOperation({ summary: 'Get warehouse address for user to copy' })
  getWarehouseAddress() {
    return this.warehouseAddress;
  }
}
