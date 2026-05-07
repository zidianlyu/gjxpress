import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateInboundPackageDto {
  @ApiPropertyOptional({ example: 'YT123456789' })
  @IsString()
  @IsOptional()
  @MaxLength(64)
  domesticTrackingNo?: string;

  @ApiPropertyOptional({ example: 'GJ1023', description: 'Customer code for auto-binding' })
  @IsString()
  @IsOptional()
  @MaxLength(16)
  customerCode?: string;

  @ApiPropertyOptional({ example: '2026-05-05T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  warehouseReceivedAt?: string;

  @ApiPropertyOptional({ example: '客户要求合箱前确认外箱状态' })
  @IsString()
  @IsOptional()
  note?: string;
}
