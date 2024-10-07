import { Test, TestingModule } from '@nestjs/testing';
import { CrawlFilmService } from './crawl-film.service';

describe('CrawlFilmService', () => {
  let service: CrawlFilmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlFilmService],
    }).compile();

    service = module.get<CrawlFilmService>(CrawlFilmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
