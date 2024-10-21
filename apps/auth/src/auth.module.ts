import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { SharedModule } from '@shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '@database/repositories';
import { User } from '@database/entities';
import { DatabaseModule } from '@database';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        RMQ_HOST: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    SharedModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, SharedModule, UserRepository],
})
export class AuthModule {}
