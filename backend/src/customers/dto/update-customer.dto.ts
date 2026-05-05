import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { CustomerStatus } from '@prisma/client';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: '+86' })
  @IsString()
  @IsOptional()
  @MaxLength(8)
  phoneCountryCode?: string;

  @ApiPropertyOptional({ example: '13900000000' })
  @IsString()
  @IsOptional()
  @MaxLength(32)
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'new_wechat_id' })
  @IsString()
  @IsOptional()
  @MaxLength(64)
  wechatId?: string;

  @ApiPropertyOptional({ example: '更新备注' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ enum: CustomerStatus })
  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus;
}
