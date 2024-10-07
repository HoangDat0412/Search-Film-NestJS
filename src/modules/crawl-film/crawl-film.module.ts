import { Module } from '@nestjs/common';
import { CrawlFilmService } from './crawl-film.service';
import { CrawlFilmController } from './crawl-film.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  providers: [CrawlFilmService],
  controllers: [CrawlFilmController]
})
export class CrawlFilmModule {}
