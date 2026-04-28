import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExceptionDto } from './dto/create-exception.dto';
import { UpdateExceptionDto } from './dto/update-exception.dto';

@Injectable()
export class ExceptionService {
  constructor(private prisma: PrismaService) {}

  async create(packageId: string, userId: string, dto: CreateExceptionDto) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      include: { order: true },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.order.user_id !== userId) throw new ForbiddenException();

    return this.prisma.exception.create({
      data: { package_id: packageId, ...dto },
    });
  }

  async updateStatus(exceptionId: string, dto: UpdateExceptionDto) {
    return this.prisma.exception.update({
      where: { id: exceptionId },
      data: { status: dto.status },
    });
  }

  async listByPackage(packageId: string) {
    return this.prisma.exception.findMany({
      where: { package_id: packageId },
      orderBy: { created_at: 'desc' },
    });
  }
}
