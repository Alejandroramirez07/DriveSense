import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenInvalidException extends HttpException {
  constructor() {
    super(
      {
        error: 'TokenInvalid',
        message: 'Invalid authentication token.',
        message_es: 'Invalid authentication token.',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
