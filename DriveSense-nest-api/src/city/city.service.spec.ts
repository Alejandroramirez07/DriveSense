import { Test, TestingModule } from '@nestjs/testing';
import { CityService } from './city.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';

const mockCity = {
  id: 1,
  name: 'Medellin',
  code: 'MDE',
  country: 'Colombia',
};

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn().mockResolvedValue([mockCity]),
  save: jest.fn().mockResolvedValue(mockCity),
  create: jest.fn().mockReturnValue(mockCity),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  findOneBy: jest.fn().mockResolvedValue(mockCity),
});

describe('CityService', () => {
  let service: CityService;
  let cityRepository: Repository<City>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
      
        {
          provide: getRepositoryToken(City),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<CityService>(CityService);
    cityRepository = module.get<Repository<City>>(getRepositoryToken(City));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

 describe('findAll', () => {
    it('should return a list of cities', async () => {
      const expectedResult = { 
          data: [mockCity], 
          message: expect.any(String)
      }; 

      const result = await service.findAll(); 
      
      expect(cityRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedResult); 
    });
  });

  describe('findOne', () => {
    it('should return a city when found', async () => {
        const id = 1;
        
        const result = await (service as any).findOne(id); 
        
        expect(cityRepository.findOneBy).toHaveBeenCalledWith({ id });
        expect(result).toEqual(mockCity);
    });
  });
});