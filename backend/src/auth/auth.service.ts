import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { WxLoginDto } from './dto/wx-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  async wxLogin(dto: WxLoginDto) {
    const openid = await this.getOpenid(dto.code);

    let user = await this.prisma.user.findUnique({ where: { openid } });

    if (!user) {
      const userCode = await this.generateUniqueUserCode();
      user = await this.prisma.user.create({
        data: {
          openid,
          user_code: userCode,
          nickname: dto.nickname,
          avatar: dto.avatar,
        },
      });
    } else if (dto.nickname || dto.avatar) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: dto.nickname ?? user.nickname,
          avatar: dto.avatar ?? user.avatar,
        },
      });
    }

    const token = this.jwtService.sign({ sub: user.id, openid: user.openid });
    return { access_token: token, user };
  }

  private async getOpenid(code: string): Promise<string> {
    const url = process.env.WX_CODE2SESSION_URL;
    const params = {
      appid: process.env.WX_APPID,
      secret: process.env.WX_SECRET,
      js_code: code,
      grant_type: 'authorization_code',
    };

    const { data } = await firstValueFrom(
      this.httpService.get(url, { params }),
    );

    if (data.errcode) {
      throw new UnauthorizedException(`WeChat error: ${data.errmsg}`);
    }

    return data.openid;
  }

  private async generateUniqueUserCode(): Promise<string> {
    let code: string;
    let exists = true;
    while (exists) {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      exists = !!(await this.prisma.user.findUnique({
        where: { user_code: code },
      }));
    }
    return code;
  }
}
