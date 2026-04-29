import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ConfirmAction {
  CONFIRM = 'CONFIRM',
  REPORT_ISSUE = 'REPORT_ISSUE',
}

export class ConfirmPackageDto {
  @ApiProperty({ enum: ConfirmAction })
  @IsEnum(ConfirmAction)
  action: ConfirmAction;

  @ApiProperty({ required: false, description: 'Issue description when action is REPORT_ISSUE' })
  @IsString()
  @IsOptional()
  description?: string;
}
