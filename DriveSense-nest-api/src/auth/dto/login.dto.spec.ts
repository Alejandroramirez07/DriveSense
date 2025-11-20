import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoginDTO } from './login.dto';

describe('LoginDTO', () => {
  it('should validate correct email and password', async () => {
    const loginData = {
      email: 'TEST@example.com',
      password: 'password123'
    };

    const loginDTO = plainToClass(LoginDTO, loginData);
    const errors = await validate(loginDTO);

    expect(errors.length).toBe(0);
    expect(loginDTO.email).toBe('test@example.com'); 
  });

  it('should fail validation with invalid email', async () => {
    const loginData = {
      email: 'invalid-email',
      password: 'password123'
    };

    const loginDTO = plainToClass(LoginDTO, loginData);
    const errors = await validate(loginDTO);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail validation with short password', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'short'
    };

    const loginDTO = plainToClass(LoginDTO, loginData);
    const errors = await validate(loginDTO);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should fail validation with long password', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'a'.repeat(33) // 33 characters
    };

    const loginDTO = plainToClass(LoginDTO, loginData);
    const errors = await validate(loginDTO);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isLength');
  });

  it('should transform email to lowercase', () => {
    const loginData = {
      email: 'TEST@EXAMPLE.COM',
      password: 'password123'
    };

    const loginDTO = plainToClass(LoginDTO, loginData);

    expect(loginDTO.email).toBe('test@example.com');
  });
});
