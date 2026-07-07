import { Test, TestingModule } from '@nestjs/testing';
import { AppelliController } from './appelli.controller';
import { AppelliService } from './appelli.service';

describe('AppelliController', () => {
  let controller: AppelliController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppelliController],
      providers: [AppelliService],
    }).compile();

    controller = module.get<AppelliController>(AppelliController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
