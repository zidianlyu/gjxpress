import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCustomerRegistrationDto {
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

  @ApiPropertyOptional({ example: '广东省广州市...' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  domesticReturnAddress?: string;

  @ApiPropertyOptional({ example: '更新备注' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ example: '资料审核中，需补充信息' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reviewNote?: string;
}
