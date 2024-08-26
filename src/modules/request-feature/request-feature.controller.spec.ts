import { Test, TestingModule } from '@nestjs/testing';
import { RequestFeatureController } from './request-feature.controller';

describe('RequestFeatureController', () => {
  let controller: RequestFeatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestFeatureController],
    }).compile();

    controller = module.get<RequestFeatureController>(RequestFeatureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
