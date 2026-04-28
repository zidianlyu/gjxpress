import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ExceptionStatus } from '@prisma/client';

export class UpdateExceptionDto {
  @ApiProperty({ enum: ExceptionStatus })
  @IsEnum(ExceptionStatus)
  status: ExceptionStatus;
}
