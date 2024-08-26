import { Test, TestingModule } from '@nestjs/testing';
import { ReportBugService } from './report-bug.service';

describe('ReportBugService', () => {
  let service: ReportBugService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportBugService],
    }).compile();

    service = module.get<ReportBugService>(ReportBugService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
