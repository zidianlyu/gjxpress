import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ConfirmAction {
  CONFIRM = 'CONFIRM',
  REPORT_ISSUE = 'REPORT_ISSUE',
}

export class ConfirmPackageDto {
  @ApiProperty({ enum: ConfirmAction })
  @IsEnum(ConfirmAction)
  action: ConfirmAction;
}
