import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateVehicleDto } from './update-vehicle.dto';

describe('UpdateVehicleDto', () => {
  it('should validate partial updates', async () => {
    const vehicleData = {
      brand: 'Updated Toyota',
      model: 'Updated Model 2018'
    };

    const dto = plainToClass(UpdateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid year in partial update', async () => {
    const vehicleData = {
      year: 1899 // Invalid year
    };

    const dto = plainToClass(UpdateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('year');
  });

  it('should allow empty update (all fields optional)', async () => {
    const vehicleData = {};

    const dto = plainToClass(UpdateVehicleDto, vehicleData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
