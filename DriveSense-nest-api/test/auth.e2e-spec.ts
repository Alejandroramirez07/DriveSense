import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      mockUserRepository.create.mockReturnValue({ id: 1, ...userData });
      mockUserRepository.save.mockResolvedValue({ id: 1, ...userData });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201)
        .expect(res => {
          expect(res.body.message).toBe('User registered successfully');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user.email).toBe(userData.email);
        });
    });

    it('should return 400 for invalid email', () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUserData)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login user and return token', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'user'
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt-token');

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.accessToken).toBe('jwt-token');
        });
    });

    it('should return 401 for invalid credentials', () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should return user profile with valid token', async () => {
      const token = 'valid-jwt-token';
      const userPayload = { id: 1, email: 'test@example.com', role: 'user' };

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(userPayload);

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(userPayload);
        });
    });
  });
});
