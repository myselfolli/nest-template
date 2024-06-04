import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { SharedService } from '@shared';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AuthModule);
  const sharedService = app.get(SharedService);

  app.connectMicroservice(sharedService.getRmqOptions('AUTH_QUEUE'));

  app.startAllMicroservices();
}
bootstrap();
