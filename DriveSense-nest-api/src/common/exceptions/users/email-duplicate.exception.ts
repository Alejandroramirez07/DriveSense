import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailDuplicateException extends HttpException {
  constructor() {
    super(
      {
        es: 'El correo ya está registrado.',
        en: 'Email is already registered.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
