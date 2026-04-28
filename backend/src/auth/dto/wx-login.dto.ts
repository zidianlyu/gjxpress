import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WxLoginDto {
  @ApiProperty({ description: 'WeChat wx.login() code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Nickname from WeChat profile', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: 'Avatar URL from WeChat profile', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;
}
