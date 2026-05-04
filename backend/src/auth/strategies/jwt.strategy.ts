import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; type: string; openid?: string; role?: string }) {
    if (payload.type === 'ADMIN') {
      const admin = await this.prisma.admin.findUnique({
        where: { id: payload.sub },
      });
      if (!admin || !admin.isActive) throw new UnauthorizedException();
      return { ...admin, type: 'ADMIN' };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();
    return { ...user, type: 'USER' };
  }
}
