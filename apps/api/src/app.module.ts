import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { SharedModule } from '@shared';

@Module({
  imports: [SharedModule],
  controllers: [AuthController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
