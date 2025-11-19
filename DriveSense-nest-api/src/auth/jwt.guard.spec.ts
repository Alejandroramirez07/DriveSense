import { JwtAuthGuard } from './jwt.guard';
import { AuthGuard } from '@nestjs/passport'; 

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should be a Guard class', () => {
    
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
  
  it('should inherit from the Passport AuthGuard', () => {
      expect(guard instanceof AuthGuard('jwt')).toBe(true);
  });
});