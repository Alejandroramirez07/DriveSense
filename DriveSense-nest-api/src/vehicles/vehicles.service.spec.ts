import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { User } from '../users/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RolesEnum } from '../users/entities/user.entity'; 

describe('VehiclesService', () => {
  let service: VehiclesService;
  let vehicleRepository: Repository<Vehicle>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: RolesEnum.USER, 
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockVehicle: Vehicle = {
    id: 1,
    licensePlate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    type: 'car',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
    logs: [],
  };

  const mockVehicleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockVehicleRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    vehicleRepository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); 
  });

  describe('create', () => {
    it('should create a vehicle successfully', async () => {
      const createVehicleDto: CreateVehicleDto = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        type: 'car'
      };

      mockVehicleRepository.findOne.mockResolvedValue(null);
      mockVehicleRepository.create.mockReturnValue(mockVehicle);
      mockVehicleRepository.save.mockResolvedValue(mockVehicle);

      const result = await service.create(createVehicleDto, mockUser);

      expect(vehicleRepository.findOne).toHaveBeenCalledWith({
        where: { licensePlate: createVehicleDto.licensePlate }
      });
     
      expect(vehicleRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...createVehicleDto,
        user: mockUser
      }));
      expect(vehicleRepository.save).toHaveBeenCalledWith(mockVehicle);
      expect(result).toEqual(mockVehicle);
    });

    it('should throw ConflictException for duplicate license plate', async () => {
      const createVehicleDto: CreateVehicleDto = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        type: 'car'
      };

      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(service.create(createVehicleDto, mockUser))
        .rejects.toThrow(ConflictException);
      await expect(service.create(createVehicleDto, mockUser))
        .rejects.toThrow('Vehicle with this license plate already exists');
      expect(vehicleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all vehicles for user', async () => {
      const vehicles = [mockVehicle];
      mockVehicleRepository.find.mockResolvedValue(vehicles);

      const result = await service.findAll(mockUser);

      expect(vehicleRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } }
      });
      expect(result).toEqual(vehicles);
    });

    it('should return empty array when no vehicles found', async () => {
      mockVehicleRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return vehicle when found', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findOne(1, mockUser);

      expect(vehicleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: { id: mockUser.id } }
      });
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException when vehicle not found', async () => {
      mockVehicleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, mockUser))
        .rejects.toThrow(NotFoundException);
      await expect(service.findOne(999, mockUser))
        .rejects.toThrow('Vehicle not found');
    });
  });

  describe('update', () => {
    it('should update vehicle successfully', async () => {
      const updateVehicleDto: UpdateVehicleDto = {
        brand: 'Updated Brand',
        model: 'Updated Model'
      };

      const existingVehicle = { ...mockVehicle }; 
      const updatedVehicle = { ...mockVehicle, ...updateVehicleDto };
      
      jest.spyOn(service, 'findOne').mockResolvedValue(existingVehicle);
      mockVehicleRepository.save.mockResolvedValue(updatedVehicle);

      const result = await service.update(1, updateVehicleDto, mockUser);

      expect(service.findOne).toHaveBeenCalledWith(1, mockUser);
      
      expect(vehicleRepository.save).toHaveBeenCalledWith(expect.objectContaining({
          id: 1,
          brand: 'Updated Brand',
          model: 'Updated Model',
          user: mockUser,
      }));
      expect(result).toEqual(updatedVehicle);
    });

    it('should throw NotFoundException when updating non-existent vehicle', async () => {
      const updateVehicleDto: UpdateVehicleDto = {
        brand: 'Updated Brand'
      };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.update(999, updateVehicleDto, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove vehicle successfully', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockVehicle);
      mockVehicleRepository.remove.mockResolvedValue(mockVehicle);

      const result = await service.remove(1, mockUser);

      expect(service.findOne).toHaveBeenCalledWith(1, mockUser);
      expect(vehicleRepository.remove).toHaveBeenCalledWith(mockVehicle);
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException when removing non-existent vehicle', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove(999, mockUser))
        .rejects.toThrow(NotFoundException);
    });
  });
});