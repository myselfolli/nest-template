import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Entities from './entities';

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
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
