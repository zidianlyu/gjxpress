import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'List published recommendations (public, no auth)' })
  listRecommendations(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('category') category?: string,
    @Query('city') city?: string,
  ) {
    return this.publicService.listRecommendations(page, pageSize, category, city);
  }

  @Get('recommendations/:slug')
  @ApiOperation({ summary: 'Get recommendation by slug (public, no auth)' })
  getRecommendation(@Param('slug') slug: string) {
    return this.publicService.getRecommendation(slug);
  }
}
