import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateCustomerRegistrationDto {
  @ApiPropertyOptional({ example: '+86' })
  @IsString()
  @IsOptional()
  @MaxLength(8)
  phoneCountryCode?: string;

  @ApiProperty({ example: '13800000000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^[\d+\s\-().]+$/, { message: 'phoneNumber must contain only digits, +, spaces, hyphens, or parentheses' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'wechat_optional' })
  @IsString()
  @IsOptional()
  @MaxLength(64)
  wechatId?: string;

  @ApiPropertyOptional({ example: '广东省广州市天河区...' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  domesticReturnAddress?: string;
}
