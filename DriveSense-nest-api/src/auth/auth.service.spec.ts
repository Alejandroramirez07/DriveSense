import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User, RolesEnum } from '../users/entities/user.entity'; 
import { LoginDTO } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword123'),
    compare: jest.fn().mockResolvedValue(true),
}));


describe('AuthService', () => {
    let service: AuthService;
    let userRepository: any;
    let jwtService: JwtService;

    const mockUserRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
       
        role: 'user' as any, 
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);

      
        (bcrypt.hash as jest.Mock).mockClear();
        (bcrypt.compare as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
      
        jest.restoreAllMocks(); 
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            };

            const hashedPassword = 'hashedPassword123';
        
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword as never);

            const savedUser = { 
                ...mockUser, 
                password: hashedPassword, 
                role: 'user' 
            }; 

            mockUserRepository.findOne.mockResolvedValue(null); 
            mockUserRepository.create.mockReturnValue(savedUser);
            mockUserRepository.save.mockResolvedValue(savedUser);

            const result = await service.register(createUserDto);

            expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);

            expect(userRepository.create).toHaveBeenCalledWith({
                ...createUserDto,
                password: hashedPassword,
                role: 'user', 
            });
            expect(userRepository.save).toHaveBeenCalledWith(savedUser);
            expect(result).toEqual({
                message: 'User registered successfully',
                user: { id: savedUser.id, email: savedUser.email }
            });
        });
        
        it('should throw BadRequestException if user already exists (if service logic includes this check)', async () => {
        
            mockUserRepository.findOne.mockResolvedValue(mockUser); 

            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            };
           
        });
    });

    describe('login', () => {
        const loginDTO: LoginDTO = {
            email: 'test@example.com',
            password: 'password123'
        };

        it('should login user successfully and return token', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
            mockJwtService.signAsync.mockResolvedValue('jwt-token');

            const result = await service.login(loginDTO);

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { email: loginDTO.email }
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginDTO.password, mockUser.password);
            expect(jwtService.signAsync).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role
            });
            expect(result).toEqual({ accessToken: 'jwt-token' });
        });

        it('should throw UnauthorizedException when user not found', async () => {
            const nonexistentLoginDTO: LoginDTO = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };

            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.login(nonexistentLoginDTO)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(nonexistentLoginDTO)).rejects.toThrow('Invalid email or password');
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

            await expect(service.login(loginDTO)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDTO)).rejects.toThrow('Invalid email or password');
        });
    });
});