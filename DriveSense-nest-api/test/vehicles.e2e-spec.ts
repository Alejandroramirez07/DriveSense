import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { VehiclesModule } from '../src/vehicles/vehicles.module';
import { Vehicle } from '../src/vehicles/entities/vehicle.entity';
import { User } from '../src/users/entities/user.entity';

describe('VehiclesController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  } as User;

  const mockVehicle = {
    id: 1,
    licensePlate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    type: 'car',
    user: mockUser,
  };

  const mockVehicleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [VehiclesModule],
    })
      .overrideProvider(getRepositoryToken(Vehicle))
      .useValue(mockVehicleRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  const generateToken = (user: Partial<User>) => {
    return jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  };

  describe('/vehicles (POST)', () => {
    it('should create a vehicle with valid data and token', async () => {
      const token = generateToken(mockUser);
      const vehicleData = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        type: 'car'
      };

      mockVehicleRepository.findOne.mockResolvedValue(null);
      mockVehicleRepository.create.mockReturnValue(mockVehicle);
      mockVehicleRepository.save.mockResolvedValue(mockVehicle);

      return request(app.getHttpServer())
        .post('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .send(vehicleData)
        .expect(201)
        .expect(res => {
          expect(res.body.licensePlate).toBe(vehicleData.licensePlate);
          expect(res.body.brand).toBe(vehicleData.brand);
        });
    });

    it('should return 401 without token', () => {
      const vehicleData = {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        type: 'car'
      };

      return request(app.getHttpServer())
        .post('/vehicles')
        .send(vehicleData)
        .expect(401);
    });
  });

  describe('/vehicles (GET)', () => {
    it('should return vehicles for admin', async () => {
      const adminUser = { ...mockUser, role: 'admin' };
      const token = generateToken(adminUser);
      const vehicles = [mockVehicle];

      mockVehicleRepository.find.mockResolvedValue(vehicles);

      return request(app.getHttpServer())
        .get('/vehicles')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
        });
    });
  });
});
