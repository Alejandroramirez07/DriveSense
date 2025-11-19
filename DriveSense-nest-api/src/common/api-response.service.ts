import { Injectable, HttpStatus } from '@nestjs/common';

@Injectable()
export class ApiResponseService {
  success(data: any, message: string = 'Success', status: HttpStatus = HttpStatus.OK) {
    return {
      statusCode: status,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  error(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    return {
      statusCode: status,
      message,
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
    };
  }
}
