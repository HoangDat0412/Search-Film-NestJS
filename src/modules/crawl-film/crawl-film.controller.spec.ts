import { Test, TestingModule } from '@nestjs/testing';
import { CrawlFilmController } from './crawl-film.controller';

describe('CrawlFilmController', () => {
  let controller: CrawlFilmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrawlFilmController],
    }).compile();

    controller = module.get<CrawlFilmController>(CrawlFilmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
