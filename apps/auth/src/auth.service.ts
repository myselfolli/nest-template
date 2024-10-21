import * as bcrypt from 'bcryptjs';
import * as jsonwebtoken from 'jsonwebtoken';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { LoginRequest, RegisterRequest } from '@dtos/auth';
import { UserRepository } from '@database/repositories';
import { User } from '@database/entities';

@Injectable()
/**
 * Service responsible for user authentication and registration.
 */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService<Record<string, unknown>, true>,
  ) {}

  /**
   * Authenticates a user with the provided login credentials.
   *
   * @param payload - The login request payload containing the user's email and password.
   * @returns A Promise that resolves to a string representing the authentication token.
   *
   * @throws HttpException with status code HttpStatus.NOT_FOUND if the user is not found.
   * @throws HttpException with status code HttpStatus.UNAUTHORIZED if the password is incorrect.
   */
  public async login(payload: LoginRequest): Promise<string> {
    const user = await this.userRepository.findOneOrFail(
      {
        where: {
          email: payload.email,
        },
      },
      new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND),
    );

    // compare the password
    const match = await bcrypt.compare(payload.password, user.password);
    if (!match) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }

    // sign the user data, excluding the password
    const { password: _, ...data } = user;
    return jsonwebtoken.sign(data, this.configService.get<string>('JWT_SECRET'));
  }

  /**
   * Registers a new user with the provided registration details.
   *
   * @param payload - The registration request payload containing the user's email, password, first name, and last name.
   * @returns A Promise that resolves to a string representing the authentication token.
   *
   * @throws HttpException with status code HttpStatus.CONFLICT if a user with the same email already exists.
   */
  public async register(payload: RegisterRequest): Promise<string> {
    const exists = await this.userRepository.exists({
      email: payload.email,
    });

    if (exists) {
      throw new HttpException('USER_ALREADY_EXISTS', HttpStatus.CONFLICT);
    }

    // hash the password
    const rounds = this.configService.get<number>('HASH_ROUNDS');
    const hashed = await bcrypt.hash(payload.password, rounds);

    // save the user data
    const user = await this.userRepository.save({
      email: payload.email,
      password: hashed,
    });

    return jsonwebtoken.sign(user, this.configService.get<string>('JWT_SECRET'));
  }

  /**
   * Verifies the validity of a JSON Web Token (JWT).
   * @param token - The JWT to be verified.
   * @returns A promise that resolves to a boolean indicating whether the JWT is valid or not.
   */
  public async verifyJwt(token: string): Promise<boolean> {
    try {
      jsonwebtoken.verify(token, this.configService.get<string>('JWT_SECRET'));
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Extracts the user from a JWT token.
   * @param token - The JWT token to extract the user from.
   * @returns A Promise that resolves to the extracted User object.
   * @throws HttpException with status code UNAUTHORIZED if the token is invalid.
   */
  public async extractUserFromJwt(token: string): Promise<User> {
    try {
      return jsonwebtoken.verify(token, this.configService.get<string>('JWT_SECRET')) as User;
    } catch (e) {
      throw new HttpException('INVALID_TOKEN', HttpStatus.UNAUTHORIZED);
    }
  }
}
