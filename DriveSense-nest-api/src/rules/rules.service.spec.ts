import { Test, TestingModule } from '@nestjs/testing';
import { RulesService } from './rules.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LogsService } from '../logss/logs.service'; 

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
});

const mockLogsService = {
  log: jest.fn(),
  error: jest.fn(),
};

const mockVehicleRepository = mockRepository();

describe('RulesService', () => {
  let service: RulesService;
  let ruleRepository;
  let cityRepository;
  let vehicleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        { provide: 'RuleRepository', useValue: mockRepository() },
        { provide: 'VehicleRepository', useValue: mockVehicleRepository }, 
        { provide: 'CityRepository', useValue: mockRepository() },
        { provide: LogsService, useValue: mockLogsService },    
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);
    ruleRepository = module.get('RuleRepository');
    vehicleRepository = module.get('VehicleRepository');
    cityRepository = module.get('CityRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a rule successfully', async () => {
      const createDto = {
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '10:00',
        restrictedDigits: ['1', '2'],
        cityId: 1,
      };

      const mockCity = { id: 1, name: 'Test City' };
      const createdRule = { 
        id: 1,
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '10:00',
        restrictedDigits: ['1', '2'],
        city: mockCity 
      };

      cityRepository.findOneBy.mockResolvedValue(mockCity);
      ruleRepository.findOne.mockResolvedValue(null);
      ruleRepository.create.mockReturnValue(createdRule);
      ruleRepository.save.mockResolvedValue(createdRule);

      const result = await service.create(createDto);

      expect(result).toEqual({
        message: 'Rule created successfully.',
        data: createdRule
      });
    });

    it('should throw NotFoundException if city not found', async () => {
      cityRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({
          dayOfWeek: 'Monday',
          startTime: '08:00',
          endTime: '10:00',
          restrictedDigits: ['1', '2'],
          cityId: 999,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if rule already exists for city and day', async () => {
      const createDto = {
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '10:00',
        restrictedDigits: ['1', '2'],
        cityId: 1,
      };

      const mockCity = { id: 1, name: 'Test City' };
      const existingRule = { id: 1, dayOfWeek: 'Monday', city: mockCity };

      cityRepository.findOneBy.mockResolvedValue(mockCity);
      ruleRepository.findOne.mockResolvedValue(existingRule);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all rules', async () => {
      const mockRules = [{ id: 1 }, { id: 2 }];
      ruleRepository.find.mockResolvedValue(mockRules);
      const result = await service.findAll();
      expect(result).toEqual({
        message: 'Total registered rules: 2',
        data: mockRules,
      });
    });
  });

  describe('findOne', () => {
    it('should return a rule by id', async () => {
      const mockRule = { id: 1 };
      ruleRepository.findOne.mockResolvedValue(mockRule);
      const result = await service.findOne(1);
      expect(result).toEqual(mockRule);
    });

    it('should throw NotFoundException if rule not found', async () => {
      ruleRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});