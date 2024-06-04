import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IResponse } from '@dtos/base/response';

@Injectable()
export class MessageInterceptor implements NestInterceptor<IResponse> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse> {
    return next.handle().pipe(
      catchError((e) => {
        if (e instanceof HttpException) {
          return of({
            meta: {
              statusCode: e.getStatus(),
              message: e.message,
              resCount: 0,
              success: false,
            },
            result: null,
          });
        } else {
          throw e;
        }
      }),
    );
  }
}
