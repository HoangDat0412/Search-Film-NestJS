import { Test, TestingModule } from '@nestjs/testing';
import { ReportBugController } from './report-bug.controller';

describe('ReportBugController', () => {
  let controller: ReportBugController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportBugController],
    }).compile();

    controller = module.get<ReportBugController>(ReportBugController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
