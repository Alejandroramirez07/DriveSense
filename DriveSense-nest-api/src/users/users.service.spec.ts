import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, RolesEnum } from './entities/user.entity'; 
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: RolesEnum.USER,
  password: 'hashed_password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSanitizedUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: RolesEnum.USER,
};

const mockRepository = () => ({
  create: jest.fn(entity => entity),
  save: jest.fn().mockResolvedValue(mockUser),
  find: jest.fn().mockResolvedValue([mockUser]),
  findOneBy: jest.fn().mockResolvedValue(mockUser),
  remove: jest.fn().mockResolvedValue(mockUser),
});

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User), 
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepo = module.get<Repository<User>>(getRepositoryToken(User));
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password'); 
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
      role: RolesEnum.ADMIN,
    };

    it('should successfully create a new user and return sanitized data', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(null); 
      
      const newHashedPassword = 'hashed_password';

      const savedUser: User = { 
        id: 2, 
        email: createDto.email, 
        name: createDto.name, 
        role: createDto.role, 
        password: newHashedPassword, 
        createdAt: mockUser.createdAt, 
        updatedAt: mockUser.updatedAt, 
    } as User;

      const expectedSanitized = { 
          ...mockSanitizedUser, 
          id: 2, 
          email: createDto.email, 
          name: createDto.name, 
          role: createDto.role, 
      };

      (usersRepo.save as jest.Mock).mockResolvedValue(savedUser);

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(usersRepo.findOneBy).toHaveBeenCalledWith({ email: createDto.email });
      expect(usersRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        email: createDto.email,
        password: newHashedPassword, 
      }));
      expect(result).toEqual(expectedSanitized); 
    });

    it('should throw BadRequestException if user with email already exists', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(mockUser); 

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(usersRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOneRaw', () => {
    it('should return the full user object if found', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findOneRaw(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.findOneRaw(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return sanitized user object if found', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result).toEqual(mockSanitizedUser);
    });
  });

  describe('findAll', () => {
    it('should return a list of sanitized users', async () => {
      
      const mockUsersList: User[] = [
            mockUser, 
            { ...mockUser, id: 2, email: 'two@test.com' } as User 
        ];
      (usersRepo.find as jest.Mock).mockResolvedValue(mockUsersList);

      const result = await service.findAll(2, 1);
      const expectedSanitizedList = mockUsersList.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));

      expect(usersRepo.find).toHaveBeenCalledWith({
        take: 2,
        skip: 0,
        order: { id: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result).toEqual(expectedSanitizedList);
    });
  });
  
  describe('findByEmail', () => {
    it('should return the full user object when email is found', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user fields and hash new password if provided', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        password: 'new_password',
      };
      
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new_password_mock');
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue({ ...mockUser });

      const savedUserAfterUpdate: User = {
          ...mockUser,
          name: 'Updated Name',
          password: 'hashed_new_password_mock',
      };

      const expectedSanitizedUser = {
          ...mockSanitizedUser,
          name: 'Updated Name',
      };
      
      (usersRepo.save as jest.Mock).mockResolvedValue(savedUserAfterUpdate);

      const result = await service.update(1, updateDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
      expect(result).toEqual(expectedSanitizedUser); 
    });

    it('should update user fields without hashing if password is not provided', async () => {
      const updateDto: UpdateUserDto = { role: RolesEnum.ADMIN };
      
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue({ ...mockUser });
      
      const savedUserAfterUpdate: User = {
          ...mockUser,
          role: RolesEnum.ADMIN,
      };
      
      const expectedSanitizedUser = {
          ...mockSanitizedUser,
          role: RolesEnum.ADMIN,
      };

      (usersRepo.save as jest.Mock).mockResolvedValue(savedUserAfterUpdate);
      
      (bcrypt.hash as jest.Mock).mockClear(); 

      const result = await service.update(1, updateDto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result).toEqual(expectedSanitizedUser); 
    });

    it('should throw NotFoundException if user is not found', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.update(999, {} as UpdateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully remove a user and return confirmation', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      (usersRepo.remove as jest.Mock).mockResolvedValue(mockUser); 

      const result = await service.remove(1);

      expect(usersRepo.remove).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        message: 'User deleted successfully',
        user: mockSanitizedUser,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      (usersRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(usersRepo.remove).not.toHaveBeenCalled();
    });
  });
});