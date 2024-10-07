import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CrawlFilmService } from './crawl-film.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
@Controller('crawl-film')
export class CrawlFilmController {
  constructor(private readonly crawlFilmService: CrawlFilmService) {}

  @Get('film')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async crawlFilms(@Query('slug') slug: string) {
    const films = await this.crawlFilmService.crawlFilms(slug);
    return { status: true, films };
  }
}
