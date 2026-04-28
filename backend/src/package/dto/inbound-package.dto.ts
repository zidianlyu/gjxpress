import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoodsItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  unit_value?: number;
}

export class InboundPackageDto {
  @ApiProperty({ description: 'Target user ID (admin assigns package to user)' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ description: 'Domestic tracking number' })
  @IsString()
  @IsNotEmpty()
  domestic_tracking_no: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  source_platform?: string;

  @ApiProperty({ description: 'Actual weight in kg' })
  @IsNumber()
  @IsPositive()
  actual_weight: number;

  @ApiProperty({ description: 'Length in cm' })
  @IsNumber()
  @IsPositive()
  length: number;

  @ApiProperty({ description: 'Width in cm' })
  @IsNumber()
  @IsPositive()
  width: number;

  @ApiProperty({ description: 'Height in cm' })
  @IsNumber()
  @IsPositive()
  height: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [GoodsItemDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsItemDto)
  @IsOptional()
  goods_items?: GoodsItemDto[];
}
