import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RolesEnum } from '../users/entities/user.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockVehiclesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUser = {
  id: 1,
  email: 'test@example.com',
  role: RolesEnum.USER,
};

const mockAdminUser = {
  id: 1,
  email: 'admin@example.com',
  role: RolesEnum.ADMIN,
};

const mockVehicle = {
  id: 1,
  licensePlate: 'ABC123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2023,
  type: 'car' as const,
  user: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let service: VehiclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        {
          provide: VehiclesService,
          useValue: mockVehiclesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<VehiclesController>(VehiclesController);
    service = module.get<VehiclesService>(VehiclesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a vehicle successfully', async () => {
      const createVehicleDto: CreateVehicleDto = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        type: 'car',
      };

      mockVehiclesService.create.mockResolvedValue(mockVehicle);

      const result = await controller.create(createVehicleDto, { user: mockUser });

      expect(service.create).toHaveBeenCalledWith(createVehicleDto, mockUser);
      expect(result).toEqual(mockVehicle);
    });

    it('should handle service errors during creation', async () => {
      const createVehicleDto: CreateVehicleDto = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        type: 'car',
      };

      mockVehiclesService.create.mockRejectedValue(new ForbiddenException('Vehicle already exists'));

      await expect(controller.create(createVehicleDto, { user: mockUser }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all vehicles for admin', async () => {
      const mockVehicles = [mockVehicle, { ...mockVehicle, id: 2, licensePlate: 'XYZ789' }];
      mockVehiclesService.findAll.mockResolvedValue(mockVehicles);

      const result = await controller.findAll({ user: mockAdminUser });

      expect(service.findAll).toHaveBeenCalledWith(mockAdminUser);
      expect(result).toEqual(mockVehicles);
    });

    it('should handle service errors when finding all vehicles', async () => {
      mockVehiclesService.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll({ user: mockAdminUser }))
        .rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by id for admin', async () => {
      mockVehiclesService.findOne.mockResolvedValue(mockVehicle);

      const result = await controller.findOne(1, { user: mockAdminUser });

      expect(service.findOne).toHaveBeenCalledWith(1, mockAdminUser);
      expect(result).toEqual(mockVehicle);
    });

    it('should return a vehicle by id for owner user', async () => {
      const userVehicle = { ...mockVehicle, user: mockUser };
      mockVehiclesService.findOne.mockResolvedValue(userVehicle);

      const result = await controller.findOne(1, { user: mockUser });

      expect(service.findOne).toHaveBeenCalledWith(1, mockUser);
      expect(result).toEqual(userVehicle);
    });

    it('should handle not found vehicle', async () => {
      mockVehiclesService.findOne.mockRejectedValue(new NotFoundException('Vehicle not found'));

      await expect(controller.findOne(999, { user: mockAdminUser }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a vehicle successfully', async () => {
      const updateVehicleDto: UpdateVehicleDto = {
        brand: 'Honda',
        model: 'Civic',
      };

      const updatedVehicle = { ...mockVehicle, brand: 'Honda', model: 'Civic' };
      mockVehiclesService.update.mockResolvedValue(updatedVehicle);

      const result = await controller.update(1, updateVehicleDto, { user: mockAdminUser });

      expect(service.update).toHaveBeenCalledWith(1, updateVehicleDto, mockAdminUser);
      expect(result).toEqual(updatedVehicle);
    });

    it('should handle update errors', async () => {
      const updateVehicleDto: UpdateVehicleDto = {
        brand: 'Honda',
      };

      mockVehiclesService.update.mockRejectedValue(new NotFoundException('Vehicle not found'));

      await expect(controller.update(999, updateVehicleDto, { user: mockAdminUser }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a vehicle successfully', async () => {
      mockVehiclesService.remove.mockResolvedValue({ message: 'Vehicle deleted successfully' });

      const result = await controller.remove(1, { user: mockAdminUser });

      expect(service.remove).toHaveBeenCalledWith(1, mockAdminUser);
      expect(result).toEqual({ message: 'Vehicle deleted successfully' });
    });

    it('should handle removal errors', async () => {
      mockVehiclesService.remove.mockRejectedValue(new NotFoundException('Vehicle not found'));

      await expect(controller.remove(999, { user: mockAdminUser }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('role-based access control', () => {
    it('should allow USER role to create vehicles', async () => {
      const createVehicleDto: CreateVehicleDto = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        type: 'car',
      };

      mockVehiclesService.create.mockResolvedValue(mockVehicle);

      const result = await controller.create(createVehicleDto, { user: mockUser });

      expect(result).toBeDefined();
    });

    it('should allow ADMIN role to access all endpoints', async () => {
      mockVehiclesService.findAll.mockResolvedValue([mockVehicle]);
      mockVehiclesService.findOne.mockResolvedValue(mockVehicle);
      mockVehiclesService.update.mockResolvedValue(mockVehicle);
      mockVehiclesService.remove.mockResolvedValue({ message: 'Deleted' });

      await expect(controller.findAll({ user: mockAdminUser })).resolves.toBeDefined();
      await expect(controller.findOne(1, { user: mockAdminUser })).resolves.toBeDefined();
      await expect(controller.update(1, {}, { user: mockAdminUser })).resolves.toBeDefined();
      await expect(controller.remove(1, { user: mockAdminUser })).resolves.toBeDefined();
    });
  });
});