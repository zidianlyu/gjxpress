import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { PackageService } from './package.service';
import { InboundPackageDto } from './dto/inbound-package.dto';
import { ConfirmPackageDto } from './dto/confirm-package.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class ReportIssueDto {
  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  imageIds?: string[];
}

@ApiTags('Package')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('packages')
export class PackageController {
  constructor(private packageService: PackageService) {}

  @Post('inbound')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '[Admin] Inbound a package' })
  inbound(@Body() dto: InboundPackageDto, @CurrentUser() user: any) {
    return this.packageService.inbound(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package detail' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.packageService.findOne(id, user.id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'User confirms package receipt or reports issue' })
  confirm(
    @Param('id') id: string,
    @Body() dto: ConfirmPackageDto,
    @CurrentUser() user: any,
  ) {
    return this.packageService.confirm(id, user.id, dto.action, dto.description);
  }

  @Post(':id/issue')
  @ApiOperation({ summary: 'User reports an issue on a package' })
  reportIssue(
    @Param('id') id: string,
    @Body() dto: ReportIssueDto,
    @CurrentUser() user: any,
  ) {
    return this.packageService.reportIssue(id, user.id, dto.type || 'OTHER', dto.description);
  }
}
