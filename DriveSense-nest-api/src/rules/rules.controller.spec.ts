import { Test, TestingModule } from '@nestjs/testing';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { RolesEnum } from '../users/entities/user.entity';

const mockRulesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RulesController', () => {
  let controller: RulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [{ provide: RulesService, useValue: mockRulesService }],
    }).compile();

    controller = module.get<RulesController>(RulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should call service.create', async () => {
    const dto = { dayOfWeek: 'Monday', startTime: '08:00', endTime: '10:00', restrictedDigits: ['1'], cityId: 1 };
    mockRulesService.create.mockResolvedValue('created');
    expect(await controller.create(dto)).toBe('created');
    expect(mockRulesService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll should call service.findAll', async () => {
    mockRulesService.findAll.mockResolvedValue('all rules');
    expect(await controller.findAll()).toBe('all rules');
  });
});