import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { RMQModule } from './rmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        RMQ_USER: Joi.string().required(),
        RMQ_PASS: Joi.string().required(),
        RMQ_HOST: Joi.string().required(),
      }),
    }),
    RMQModule,
  ],
  providers: [SharedService],
  exports: [SharedService, RMQModule],
})
export class SharedModule {}
