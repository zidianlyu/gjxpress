import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WxLoginDto } from './dto/wx-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'WeChat Mini Program login via code' })
  login(@Body() dto: WxLoginDto) {
    return this.authService.wxLogin(dto);
  }
}
