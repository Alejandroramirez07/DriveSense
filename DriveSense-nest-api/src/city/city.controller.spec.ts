import { Test, TestingModule } from '@nestjs/testing';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { NotFoundException } from '@nestjs/common';

const mockCity = { id: 1, name: 'Medellin', code: 'MDE', country: 'Colombia' };

const mockCityService = {
  findAll: jest.fn().mockResolvedValue({ 
    data: [mockCity], 
    message: 'List of registered cities (1).' 
  }),
  findOne: jest.fn().mockResolvedValue(mockCity),
  create: jest.fn().mockResolvedValue(mockCity),
  update: jest.fn().mockResolvedValue(mockCity),
  remove: jest.fn().mockResolvedValue({}),
};

describe('CityController', () => {
  let controller: CityController;
  let service: CityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [
        {
          provide: CityService,
          useValue: mockCityService, 
        },
      ],
    }).compile();

    controller = module.get<CityController>(CityController);
    service = module.get<CityService>(CityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call cityService.findAll and return the list', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({ 
          data: [mockCity], 
          message: 'List of registered cities (1).' 
      });
    });
  });
});