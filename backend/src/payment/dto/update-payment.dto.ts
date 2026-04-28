import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  final_price?: number;

  @ApiProperty({ description: 'Mark as manual override', required: false })
  @IsBoolean()
  @IsOptional()
  manual_override?: boolean;
}
