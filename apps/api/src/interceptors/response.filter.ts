import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ResponseFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (ctx.getResponse().meta) {
      httpAdapter.reply(ctx.getResponse(), ctx.getResponse().body, httpStatus);
      return;
    } else {
      const meta = {
        statusCode: httpStatus,
        message: exception instanceof HttpException ? exception.message : 'Internal Server Error',
        resCount: 0,
        success: false,
        additionalInfo: '',
      };
      httpAdapter.reply(ctx.getResponse(), { meta, result: [] }, httpStatus);
    }
  }
}
