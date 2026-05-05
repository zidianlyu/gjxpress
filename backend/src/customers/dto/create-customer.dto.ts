import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiPropertyOptional({ example: '+86' })
  @IsString()
  @IsOptional()
  @MaxLength(8)
  phoneCountryCode?: string;

  @ApiProperty({ example: '13800000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'wechat_id_optional' })
  @IsString()
  @IsOptional()
  @MaxLength(64)
  wechatId?: string;

  @ApiPropertyOptional({ example: '内部备注' })
  @IsString()
  @IsOptional()
  notes?: string;
}
