import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { WxLoginDto } from './dto/wx-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async wxLogin(dto: WxLoginDto) {
    const openid = await this.getOpenid(dto.code);

    let user = await this.prisma.user.findUnique({ where: { openid } });

    if (!user) {
      const userCode = await this.generateUniqueUserCode();
      user = await this.prisma.user.create({
        data: {
          openid,
          userCode: userCode,
          nickname: dto.nickname,
          avatarUrl: dto.avatarUrl,
        },
      });
    } else if (dto.nickname || dto.avatarUrl) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: dto.nickname ?? user.nickname,
          avatarUrl: dto.avatarUrl ?? user.avatarUrl,
        },
      });
    }

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    const token = this.jwtService.sign(
      {
        sub: user.id,
        type: 'USER',
        openid: user.openid,
      },
      { expiresIn: expiresIn as any },
    );

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.parseExpiresIn(expiresIn),
      user: {
        id: user.id,
        userCode: user.userCode,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async adminLogin(dto: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Simple password hash verification (SHA-256)
    const passwordHash = this.hashPassword(dto.password);
    if (passwordHash !== admin.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const expiresIn = this.configService.get<string>('ADMIN_JWT_EXPIRES_IN') || '1d';
    const token = this.jwtService.sign(
      {
        sub: admin.id,
        type: 'ADMIN',
        role: admin.role,
      },
      { expiresIn: expiresIn as any },
    );

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.parseExpiresIn(expiresIn),
      admin: {
        id: admin.id,
        username: admin.username,
        displayName: admin.displayName,
        role: admin.role,
      },
    };
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 86400; // default 1 day
    const [, value, unit] = match;
    const num = parseInt(value!, 10);
    switch (unit) {
      case 'd': return num * 86400;
      case 'h': return num * 3600;
      case 'm': return num * 60;
      case 's': return num;
      default: return 86400;
    }
  }

  private async getOpenid(code: string): Promise<string> {
    const mockLogin = this.configService.get<string>('WECHAT_MOCK_LOGIN') === 'true';

    if (mockLogin) {
      return `mock_openid_${code}`;
    }

    const url = this.configService.get<string>('WECHAT_CODE2SESSION_URL')
      || 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: this.configService.get<string>('WECHAT_APP_ID'),
      secret: this.configService.get<string>('WECHAT_APP_SECRET'),
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
        where: { userCode: code },
      }));
    }
    return code;
  }
}
