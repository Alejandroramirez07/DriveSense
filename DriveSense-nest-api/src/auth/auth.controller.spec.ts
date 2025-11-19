import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt.guard';
import { UnauthorizedException, UseGuards } from '@nestjs/common'; 
import 'reflect-metadata'; 

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
};

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const expectedResult = {
        message: 'User registered successfully',
        user: { id: 1, email: 'test@example.com' }
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should login user and return access token', async () => {
      const loginDTO: LoginDTO = {
        email: 'test@example.com',
        password: 'password123'
      };

      const expectedResult = {
        accessToken: 'jwt-token'
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDTO);

      expect(authService.login).toHaveBeenCalledWith(loginDTO);
      expect(result).toEqual(expectedResult);
    });

    it('should handle login errors', async () => {
      const loginDTO: LoginDTO = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDTO)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const mockRequest = {
        user: mockUser
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });

    it('should be protected with JwtAuthGuard', () => {
     
      const guards = Reflect.getMetadata('__guards__', controller.getProfile); 

      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
      
      const hasJwtGuard = guards.some((guard: Function) => guard === JwtAuthGuard);
      
      expect(hasJwtGuard).toBeTruthy();
    });
  });
});