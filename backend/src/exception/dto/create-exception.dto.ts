import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExceptionType } from '@prisma/client';

export class CreateExceptionDto {
  @ApiProperty({ enum: ExceptionType })
  @IsEnum(ExceptionType)
  type: ExceptionType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
