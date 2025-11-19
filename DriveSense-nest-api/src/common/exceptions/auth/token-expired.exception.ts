import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenExpiredException extends HttpException {
  constructor() {
    super(
      {
        error: 'TokenExpired',
        message: 'Authentication token has expired.',
        message_es: 'Authentication token has expired.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
