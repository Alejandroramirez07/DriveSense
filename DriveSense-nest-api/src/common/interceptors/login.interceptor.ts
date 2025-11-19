import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { LogsService } from '../../logss/logs.service'; 
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const method = req.method;
    const endpoint = req.originalUrl;
    
    const body = req.body ? JSON.stringify(req.body) : undefined; 
    
    const user = req.user?.email || 'anonymous'; 

    return next.handle().pipe(
      tap(() => {
        
        this.logsService.create({
          user,
          method,
          endpoint,
          body,
        });
      }),
    );
  }
}
