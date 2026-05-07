import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async getWarehouseAddress(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userCode: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const recipientName = this.configService.get<string>('WAREHOUSE_RECIPIENT_NAME') || '';
    const phone         = this.configService.get<string>('WAREHOUSE_PHONE') || '';
    const country       = this.configService.get<string>('WAREHOUSE_COUNTRY') || '中国';
    const province      = this.configService.get<string>('WAREHOUSE_PROVINCE') || '';
    const city          = this.configService.get<string>('WAREHOUSE_CITY') || '';
    const district      = this.configService.get<string>('WAREHOUSE_DISTRICT') || '';
    const addressLine   = this.configService.get<string>('WAREHOUSE_ADDRESS_LINE') || '';
    const postalCode    = this.configService.get<string>('WAREHOUSE_POSTAL_CODE') || '';

    const userCode = user.userCode || '';
    const recipientNameWithUserCode = userCode
      ? `${recipientName}-${userCode}`
      : recipientName;

    const addressParts = [province, city, district, addressLine].filter(Boolean).join('');
    const fullAddress = `${country}${addressParts}`;

    const template = this.configService.get<string>('WAREHOUSE_COPY_TEMPLATE')
      || '收件人：{recipientName}\n电话：{phone}\n地址：{fullAddress}\n邮编：{postalCode}';

    const copyText = template
      .replace('{recipientName}', recipientNameWithUserCode)
      .replace('{phone}', phone)
      .replace('{fullAddress}', fullAddress)
      .replace('{postalCode}', postalCode);

    return {
      data: {
        receiverName: recipientNameWithUserCode,
        phone,
        country,
        province,
        city,
        district,
        addressLine,
        postalCode,
        formattedAddress: `收件人：${recipientNameWithUserCode}，电话：${phone}，地址：${fullAddress}，邮编：${postalCode}`,
        copyText,
        instructions: [
          '请在淘宝/京东下单时复制本地址。',
          '收件人中请保留您的用户ID，方便仓库识别。',
          '仓库收到包裹后会拍照上传，您可在官网查询状态。',
        ],
      },
    };
  }
}
