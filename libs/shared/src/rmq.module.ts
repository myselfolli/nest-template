import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';
import { RmqService } from './microServices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RMQ_USER: Joi.string().required(),
        RMQ_PASS: Joi.string().required(),
        RMQ_HOST: Joi.string().required(),
      }),
    }),
  ],
  providers: RMQModule.allRMQServices.map((service) => RMQModule.registerRmq(service).providers![0]!),
  exports: RMQModule.allRMQServices.map((service) => `${service}_SERVICE`),
})
export class RMQModule {
  static allRMQServices: RmqService[] = Object.values(RmqService);
  static registerRmq(serviceName: RmqService): DynamicModule {
    const providers = [
      {
        provide: `${serviceName}_SERVICE`,
        useFactory: (configService: ConfigService<Record<string, unknown>, true>): ClientProxy => {
          const RMQ_USER = configService.get<string>('RMQ_USER');
          const RMQ_PASS = configService.get<string>('RMQ_PASS');
          const RMQ_HOST = configService.get<string>('RMQ_HOST');

          return ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
              urls: [`amqp://${RMQ_USER}:${RMQ_PASS}@${RMQ_HOST}`],
              queue: `${serviceName.toUpperCase()}_QUEUE`,
              queueOptions: {
                durable: false,
              },
            },
          });
        },
        inject: [ConfigService],
      },
    ];

    return {
      module: RMQModule,
      providers,
      exports: providers,
    };
  }
}
