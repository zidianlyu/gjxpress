import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ description: 'Admin username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Admin password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
