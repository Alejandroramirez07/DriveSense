import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateVehicleDto } from './create-vehicle.dto';

describe('CreateVehicleDto', () => {
  it('should validate correct vehicle data', async () => {
    const vehicleData = {
      licensePlate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      type: 'car'
    };

    const dto = plainToClass(CreateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty license plate', async () => {
    const vehicleData = {
      licensePlate: '',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      type: 'car'
    };

    const dto = plainToClass(CreateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('licensePlate');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with invalid year (too old)', async () => {
    const vehicleData = {
      licensePlate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 1899,
      type: 'car'
    };

    const dto = plainToClass(CreateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('year');
    expect(errors[0].constraints).toHaveProperty('min');
  });

  it('should fail validation with invalid year (future)', async () => {
    const currentYear = new Date().getFullYear();
    const vehicleData = {
      licensePlate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: currentYear + 1,
      type: 'car'
    };

    const dto = plainToClass(CreateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('year');
    expect(errors[0].constraints).toHaveProperty('max');
  });

  it('should fail validation with invalid vehicle type', async () => {
    const vehicleData = {
      licensePlate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      type: 'invalid-type' as any
    };

    const dto = plainToClass(CreateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('type');
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should validate motorcycle type correctly', async () => {
    const vehicleData = {
      licensePlate: 'MOTO123',
      brand: 'Honda',
      model: 'CBR',
      year: 2021,
      type: 'motorcycle'
    };

    const dto = plainToClass(CreateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
