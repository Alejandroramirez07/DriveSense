import { validate } from 'class-validator';
import { CreateRuleDto } from './create-rule.dto';

describe('CreateRuleDto Validation', () => {
  let dto: CreateRuleDto;

  beforeEach(() => {
    dto = new CreateRuleDto();
    dto.dayOfWeek = 'Monday';
    dto.startTime = '06:30';
    dto.endTime = '19:30';
    dto.restrictedDigits = ['1', '2'];
    dto.cityId = 1;
  });

  it('should validate successfully with correct data', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when dayOfWeek is empty', async () => {
    dto.dayOfWeek = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when startTime has invalid format', async () => {
    dto.startTime = '6:30';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when endTime has invalid format', async () => {
    dto.endTime = '25:00';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when restrictedDigits is empty', async () => {
    dto.restrictedDigits = [];
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when restrictedDigits is not an array', async () => {
    // @ts-ignore on purpose to simulate wrong data
    dto.restrictedDigits = '123';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when cityId is not an integer', async () => {
    // @ts-ignore
    dto.cityId = 'ABC';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when cityId is missing', async () => {
    // @ts-ignore
    dto.cityId = undefined;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});