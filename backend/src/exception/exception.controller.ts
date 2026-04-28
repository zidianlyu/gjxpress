import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExceptionService } from './exception.service';
import { CreateExceptionDto } from './dto/create-exception.dto';
import { UpdateExceptionDto } from './dto/update-exception.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Exception')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('packages/:packageId/exceptions')
export class ExceptionController {
  constructor(private exceptionService: ExceptionService) {}

  @Post()
  @ApiOperation({ summary: 'User reports an exception on a package' })
  create(
    @Param('packageId') packageId: string,
    @Body() dto: CreateExceptionDto,
    @CurrentUser() user: any,
  ) {
    return this.exceptionService.create(packageId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List exceptions for a package' })
  list(@Param('packageId') packageId: string) {
    return this.exceptionService.listByPackage(packageId);
  }

  @Patch(':exceptionId/status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Update exception status' })
  updateStatus(
    @Param('exceptionId') exceptionId: string,
    @Body() dto: UpdateExceptionDto,
  ) {
    return this.exceptionService.updateStatus(exceptionId, dto);
  }
}
