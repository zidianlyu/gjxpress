import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateShipmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tracking_number: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  estimated_arrival?: string;
}
