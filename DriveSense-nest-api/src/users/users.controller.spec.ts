import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ParseIntPipe, UseGuards, Controller, Get, Put, Delete, Post } from '@nestjs/common';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles, ROLES_KEY } from 'src/auth/roles.decorator';
import { RolesEnum } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

// --- Mocking Services and Data ---
const mockSanitizedUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: RolesEnum.USER,
};

const mockUsersService = {
  findAll: jest.fn().mockResolvedValue([mockSanitizedUser]),
  findOne: jest.fn().mockResolvedValue(mockSanitizedUser),
  update: jest.fn().mockResolvedValue(mockSanitizedUser),
  remove: jest.fn().mockResolvedValue({ message: 'User deleted successfully', user: mockSanitizedUser }),
  create: jest.fn().mockResolvedValue(mockSanitizedUser),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Authorization Decorators', () => {
    it('should be decorated with JwtAuthGuard and RolesGuard', () => {
      const guards = Reflect.getMetadata('__guards__', UsersController);
      expect(guards).toHaveLength(2);
      expect(guards[0]).toBe(JwtAuthGuard);
      expect(guards[1]).toBe(RolesGuard);
    });

    it('findAll should be restricted to ADMIN role', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.findAll);
      expect(roles).toEqual([RolesEnum.ADMIN]);
    });

    it('findOne should allow ADMIN and USER roles', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.findOne);
      expect(roles).toEqual([RolesEnum.ADMIN, RolesEnum.USER]);
    });

    it('update should allow ADMIN and USER roles', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.update);
      expect(roles).toEqual([RolesEnum.ADMIN, RolesEnum.USER]);
    });

    it('remove should be restricted to ADMIN role', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.remove);
      expect(roles).toEqual([RolesEnum.ADMIN]);
    });
  });

  describe('findAll', () => {
    it('should call usersService.findAll with default pagination', async () => {
      const result = await controller.findAll('10', '1');
      expect(service.findAll).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual([mockSanitizedUser]);
    });

    it('should call usersService.findAll with custom pagination', async () => {
      await controller.findAll('5', '2');
      expect(service.findAll).toHaveBeenCalledWith(5, 2);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with the correct ID', async () => {
      const id = 1;
      const result = await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockSanitizedUser);
    });
  });

  describe('update', () => {
    it('should call usersService.update with the correct ID and DTO', async () => {
      const id = 1;
      const dto: UpdateUserDto = { name: 'Updated Name' };
      const result = await controller.update(id, dto);
      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(mockSanitizedUser);
    });
  });

  describe('remove', () => {
    it('should call usersService.remove with the correct ID', async () => {
      const id = 1;
      const result = await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual({ message: 'User deleted successfully', user: mockSanitizedUser });
    });
  });
});