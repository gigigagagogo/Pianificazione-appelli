import { Test, TestingModule } from '@nestjs/testing';
import { AppelliService } from './appelli.service';

describe('AppelliService', () => {
  let service: AppelliService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppelliService],
    }).compile();

    service = module.get<AppelliService>(AppelliService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
