import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super(
      {
        error: 'InvalidCredentials',
        message: 'Invalid credentials provided.',
        message_es: 'Invalid credentials provided..',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
