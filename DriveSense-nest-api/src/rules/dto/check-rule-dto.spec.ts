import { validate } from 'class-validator';
import { CheckRuleDto } from './check-rule.dto';

describe('CheckRuleDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = new CheckRuleDto();
    dto.licensePlate = 'ABC123';
    dto.cityId = 1;
    dto.date = '2025-11-12T14:00:00';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if licensePlate is missing', async () => {
    const dto = new CheckRuleDto();
    dto.cityId = 1;
    dto.date = '2025-11-12T14:00:00';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('licensePlate');
  });

  it('should fail if licensePlate is not a string', async () => {
    const dto: any = new CheckRuleDto();
    dto.licensePlate = 12345;
    dto.cityId = 1;
    dto.date = '2025-11-12T14:00:00';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if cityId is not a number', async () => {
    const dto: any = new CheckRuleDto();
    dto.licensePlate = 'ABC123';
    dto.cityId = 'not-number';
    dto.date = '2025-11-12T14:00:00';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('cityId');
  });

  it('should fail if date is not a valid ISO string', async () => {
    const dto = new CheckRuleDto();
    dto.licensePlate = 'ABC123';
    dto.cityId = 1;
    dto.date = 'invalid-date';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('date');
  });

  it('should fail if fields are completely empty', async () => {
    const dto = new CheckRuleDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(3); // 3 required fields
  });
});