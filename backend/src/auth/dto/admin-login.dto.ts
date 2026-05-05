import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AdminLoginDto {
  @ApiPropertyOptional({ description: 'Admin username (legacy, for old Admin model)' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ description: 'Phone country code, e.g. +86', example: '+86' })
  @IsString()
  @IsOptional()
  phoneCountryCode?: string;

  @ApiPropertyOptional({ description: 'Phone number, e.g. 13800000000', example: '13800000000' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Shorthand phone (normalized to +86 + phoneNumber)', example: '13800000000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Admin password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
