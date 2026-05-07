import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WxLoginDto } from './dto/wx-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiGenericCreated, ApiGenericOk, ApiStandardResponses } from '../common/swagger/api-docs';

@ApiTags('Auth')
@ApiStandardResponses({ forbidden: true, notFound: true, conflict: true })
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('wechat-login')
  @ApiOperation({ summary: 'WeChat Mini Program login via code' })
  @ApiGenericCreated('User login successful; returns JWT and user profile data.')
  wechatLogin(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto);
  }

  @Post('admin-login')
  @ApiOperation({ summary: 'Admin login with username and password' })
  @ApiGenericCreated('Admin login successful; returns JWT and admin profile data.')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user/admin profile' })
  @ApiStandardResponses({ auth: true })
  @ApiGenericOk('Authenticated JWT payload.')
  getMe(@CurrentUser() user: any) {
    return { data: user };
  }
}
