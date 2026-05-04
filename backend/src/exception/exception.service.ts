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
    if (pkg.order.userId !== userId) throw new ForbiddenException();

    return this.prisma.exceptionCase.create({
      data: {
        orderId: pkg.order.id,
        packageId,
        type: dto.type,
        description: dto.description,
        createdByUserId: userId,
      },
    });
  }

  async updateStatus(exceptionId: string, dto: UpdateExceptionDto) {
    return this.prisma.exceptionCase.update({
      where: { id: exceptionId },
      data: { status: dto.status },
    });
  }

  async listByPackage(packageId: string) {
    return this.prisma.exceptionCase.findMany({
      where: { packageId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
