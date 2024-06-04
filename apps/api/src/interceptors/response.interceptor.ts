import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException } from '@nestjs/common';
import { IMeta, IResponse } from '@dtos';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor<IResponse> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse> {
    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      catchError((e) => {
        if (!(e instanceof HttpException)) {
          console.error(e);
          const newRes: IResponse = {
            meta: {
              statusCode: 500,
              message: 'Internal Server Error',
              resCount: 0,
              success: false,
            },
            result: null,
          };

          return of(newRes);
        }
        const meta: IMeta = {
          statusCode: e.getStatus(),
          message: e.message,
          resCount: 0,
          success: false,
          additionalInformation: undefined,
        };
        const response = e.getResponse();
        if (typeof response === 'object') {
          if (Object.keys(response).includes('message')) {
            const res = response as Record<string, unknown>;
            meta.additionalInformation = res['message'];
          }
        }

        return of({
          result: null,
          meta,
        });
      }),
      map((response: IResponse) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(response.meta.statusCode);
        if (response.result === undefined) {
          response.result = null;
        }
        return response;
      }),
    );
  }
}
