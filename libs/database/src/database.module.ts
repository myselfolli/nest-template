import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Entities from './entities';
import * as Repositories from './repositories';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PG_USER: Joi.string().required(),
        PG_PASS: Joi.string().required(),
        PG_HOST: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<Record<string, unknown>, true>,
      ): Promise<TypeOrmModuleOptions> => {
        const PG_USER = configService.get<string>('PG_USER');
        const PG_PASS = configService.get<string>('PG_PASS');
        const PG_HOST = configService.get<string>('PG_HOST');

        return {
          type: 'postgres',
          host: PG_HOST,
          port: 5432,
          username: PG_USER,
          password: PG_PASS,
          database: 'postgres',
          useUTC: true,
          entities: Object.values(Entities),
        };
      },
    }),
    TypeOrmModule.forFeature(Object.values(Entities)),
  ],
  providers: [...Object.values(Repositories)],
  exports: [
    ...Object.values(Repositories),
    TypeOrmModule.forFeature(Object.values(Entities))
  ],
})
export class DatabaseModule {}
