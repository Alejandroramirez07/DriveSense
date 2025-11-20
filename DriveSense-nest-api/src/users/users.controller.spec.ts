import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesEnum } from './entities/user.entity';
import { JwtAuthGuard } from './../auth/jwt.guard';
import { RolesGuard } from './../auth/roles.guard';
import { Reflector } from '@nestjs/core';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForbiddenException } from '@nestjs/common';

const ROLES_KEY = 'roles';

const mockUsersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Authorization Decorators', () => {
    it('findAll should be restricted to ADMIN role', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.findAll);
      expect(roles).toEqual([RolesEnum.ADMIN]);
    });

    it('findOne should allow ADMIN and USER roles', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.findOne);
      expect(roles).toEqual([RolesEnum.ADMIN]);
    });

    it('update should allow ADMIN and USER roles', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.update);
      expect(roles).toEqual(undefined);
    });

    it('remove should be restricted to ADMIN role', () => {
      const roles = Reflect.getMetadata(ROLES_KEY, controller.remove);
      expect(roles).toEqual([RolesEnum.ADMIN]);
    });
  });

  describe('findAll', () => {
    it('should call usersService.findAll with default limit and page', async () => {
      await controller.findAll('10', '1');
      expect(userService.findAll).toHaveBeenCalledWith(10, 1);
    });

    it('should call usersService.findAll with custom limit and page', async () => {
      await controller.findAll('5', '2');
      expect(userService.findAll).toHaveBeenCalledWith(5, 2);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with the correct ID', async () => {
      const mockId = 1;
      await controller.findOne(mockId);
      expect(userService.findOne).toHaveBeenCalledWith(mockId);
    });
  });

  describe('update', () => {
    const mockId = 1;
    const mockUpdateDto: UpdateUserDto = { name: 'New Name' };

    beforeEach(() => {
      mockUsersService.update.mockResolvedValue(true);
    });

    it('should call usersService.update for the authenticated user', async () => {
      const mockReq = { user: { id: mockId, role: RolesEnum.USER } };
      await controller.update(mockReq, mockId, mockUpdateDto);
      
      const expectedDto = { name: 'New Name' };
      expect(userService.update).toHaveBeenCalledWith(mockId, expectedDto);
    });

    it('should allow ADMIN to update any user', async () => {
      const otherUserId = 2;
      const mockReq = { user: { id: 999, role: RolesEnum.ADMIN } };

      await controller.update(mockReq, otherUserId, mockUpdateDto);
      
      const expectedDto = { name: 'New Name' };
      expect(userService.update).toHaveBeenCalledWith(otherUserId, expectedDto);
    });

    it('should prevent a non-admin user from updating another user', async () => {
      const otherUserId = 2;
      const mockReq = { user: { id: 5, role: RolesEnum.USER } }; 

      try {
        await controller.update(mockReq, otherUserId, mockUpdateDto);
        fail('Expected ForbiddenException, but none was thrown.'); 
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toEqual('No puedes actualizar otro usuario');
      }
      
      expect(userService.update).not.toHaveBeenCalled();
    });

    it('should delete the role property from the DTO before calling service', async () => {
      const mockReq = { user: { id: mockId, role: RolesEnum.ADMIN } };
      const dtoWithRole: UpdateUserDto = { ...mockUpdateDto, role: RolesEnum.ADMIN };

      await controller.update(mockReq, mockId, dtoWithRole);

      const expectedDto = { name: 'New Name' };
      expect(userService.update).toHaveBeenCalledWith(mockId, expectedDto);
    });
  });

  describe('remove', () => {
    it('should call usersService.remove with the correct ID', async () => {
      const mockId = 1;
      await controller.remove(mockId);
      expect(userService.remove).toHaveBeenCalledWith(mockId);
    });
  });
});