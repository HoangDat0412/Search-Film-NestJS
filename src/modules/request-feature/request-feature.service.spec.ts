import { Test, TestingModule } from '@nestjs/testing';
import { RequestFeatureService } from './request-feature.service';

describe('RequestFeatureService', () => {
  let service: RequestFeatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestFeatureService],
    }).compile();

    service = module.get<RequestFeatureService>(RequestFeatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
