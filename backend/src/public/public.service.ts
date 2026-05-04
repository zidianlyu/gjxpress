import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async listRecommendations(page: any = 1, pageSize: any = 20, category?: string, city?: string) {
    const take = Math.min(Number(pageSize) || 20, 100);
    const skip = (Number(page) - 1) * take;

    const where: any = { status: 'PUBLISHED' };
    if (category) where.category = category;
    if (city) where.city = city;

    const [data, total] = await Promise.all([
      this.prisma.recommendation.findMany({
        where,
        skip,
        take,
        select: { id: true, slug: true, title: true, summary: true, category: true, city: true, tags: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.recommendation.count({ where }),
    ]);

    return {
      data,
      pagination: { page: Number(page), pageSize: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  async getRecommendation(slug: string) {
    const rec = await this.prisma.recommendation.findUnique({ where: { slug } });
    if (!rec || rec.status !== 'PUBLISHED') throw new NotFoundException('Recommendation not found');
    return { data: rec };
  }
}
