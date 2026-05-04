import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
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
    if (!dto.code || dto.code.trim() === '') {
      throw new BadRequestException('code is required');
    }

    const openid = await this.getOpenid(dto.code.trim());

    let user = await this.prisma.user.findUnique({ where: { openid } });

    if (!user) {
      const userCode = await this.generateUniqueUserCode();
      try {
        user = await this.prisma.user.create({
          data: {
            openid,
            userCode,
            nickname: dto.nickname || null,
            avatarUrl: dto.avatarUrl || null,
          },
        });
      } catch (e: any) {
        if (e.code === 'P2002') {
          const existing = await this.prisma.user.findUnique({ where: { openid } });
          if (existing) {
            user = existing;
          } else {
            console.error('[wechat-login] user create conflict, prisma code:', e.code, 'meta:', e.meta?.target);
            throw new InternalServerErrorException('Failed to create user account');
          }
        } else {
          console.error('[wechat-login] user create error, prisma code:', e.code);
          throw new InternalServerErrorException('Failed to create user account');
        }
      }
    } else if (dto.nickname !== undefined || dto.avatarUrl !== undefined) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          ...(dto.nickname !== undefined && { nickname: dto.nickname || null }),
          ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl || null }),
        },
      });
    }

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    const token = this.jwtService.sign(
      { sub: user.id, type: 'USER', openid: user.openid },
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
      console.log('[wechat-login] mock mode enabled, openid:', `mock_openid_${code}`);
      return `mock_openid_${code}`;
    }

    const appId = this.configService.get<string>('WECHAT_APP_ID');
    const appSecret = this.configService.get<string>('WECHAT_APP_SECRET');
    if (!appId || !appSecret) {
      console.error('[wechat-login] WECHAT_APP_ID or WECHAT_APP_SECRET not configured');
      throw new ServiceUnavailableException('WeChat login not configured on server');
    }

    const url = this.configService.get<string>('WECHAT_CODE2SESSION_URL')
      || 'https://api.weixin.qq.com/sns/jscode2session';

    let data: any;
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(url, {
            params: {
              appid: appId,
              secret: appSecret,
              js_code: code,
              grant_type: 'authorization_code',
            },
          })
          .pipe(timeout(5000)),
      );
      data = response.data;
    } catch (e: any) {
      if (e.name === 'TimeoutError' || e.code === 'ECONNABORTED') {
        console.error('[wechat-login] WeChat code2Session timed out');
        throw new ServiceUnavailableException('WeChat service timeout, please retry');
      }
      console.error('[wechat-login] WeChat code2Session network error:', e.message);
      throw new ServiceUnavailableException('WeChat service unavailable');
    }

    if (data.errcode) {
      console.error('[wechat-login] WeChat errcode:', data.errcode, 'errmsg:', data.errmsg);
      // 40029 = invalid code, 40163 = code used, 45011 = frequency limit
      if (data.errcode === 40029 || data.errcode === 40163) {
        throw new BadRequestException('Invalid or expired WeChat code');
      }
      if (data.errcode === 40125 || data.errcode === 40164) {
        throw new UnauthorizedException('WeChat app credentials invalid');
      }
      throw new ServiceUnavailableException(`WeChat service error (${data.errcode})`);
    }

    if (!data.openid) {
      console.error('[wechat-login] WeChat returned no openid, response keys:', Object.keys(data));
      throw new ServiceUnavailableException('WeChat returned no openid');
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
