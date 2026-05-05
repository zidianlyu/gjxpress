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
import * as bcrypt from 'bcryptjs';
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
    if (!dto.password) {
      throw new BadRequestException('password is required');
    }

    const expiresIn = this.configService.get<string>('ADMIN_JWT_EXPIRES_IN') || '1d';

    // ── Phone-based AdminAccount login (new Web path) ──────────────────────
    const hasPhone = dto.phoneNumber || dto.phone;
    if (hasPhone) {
      const countryCode = dto.phoneCountryCode || '+86';
      const number = (dto.phoneNumber || dto.phone)!.trim();

      const account = await this.prisma.adminAccount.findFirst({
        where: { phoneCountryCode: countryCode, phoneNumber: number },
      });

      if (!account || account.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid credentials');
      }

      const valid = await bcrypt.compare(dto.password, account.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      await this.prisma.adminAccount.update({
        where: { id: account.id },
        data: { lastLoginAt: new Date() },
      });

      const token = this.jwtService.sign(
        { sub: account.id, type: 'ADMIN', role: account.role, authModel: 'AdminAccount' },
        { expiresIn: expiresIn as any },
      );

      return {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: this.parseExpiresIn(expiresIn),
        admin: {
          id: account.id,
          phoneCountryCode: account.phoneCountryCode,
          phoneNumber: account.phoneNumber,
          displayName: account.displayName,
          role: account.role,
        },
      };
    }

    // ── Legacy username-based Admin login (backward compat) ────────────────
    if (!dto.username) {
      throw new BadRequestException('Provide either phoneNumber or username');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordHash = this.hashPasswordSha256(dto.password);
    if (passwordHash !== admin.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign(
      { sub: admin.id, type: 'ADMIN', role: admin.role, authModel: 'Admin' },
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

  private hashPasswordSha256(password: string): string {
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
