import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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

}
