import { Controller, HttpStatus, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Payload } from '@nestjs/microservices';
import { LoginRequest, RegisterRequest, UserResponse } from '@dtos/auth';
import { SharedService } from '@shared';
import { MessageInterceptor } from '@shared/messageInterceptor';
import { AutoMessagePattern } from '@shared/autoMessagePattern';
import { GeneralBooleanResponse, GeneralStringResponse } from '@dtos';

@Controller()
@UseInterceptors(new MessageInterceptor())
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
  ) {}

  @AutoMessagePattern()
  public async login(@Payload() payload: LoginRequest): Promise<GeneralStringResponse> {
    const res = await this.authService.login(payload);
    return {
      meta: this.sharedService.getMeta(HttpStatus.OK),
      result: res,
    };
  }

  @AutoMessagePattern()
  public async register(@Payload() payload: RegisterRequest): Promise<GeneralStringResponse> {
    const res = await this.authService.register(payload);
    return {
      meta: this.sharedService.getMeta(HttpStatus.OK),
      result: res,
    };
  }

  @AutoMessagePattern()
  public async validateToken(@Payload() token: string): Promise<GeneralBooleanResponse> {
    const res = await this.authService.verifyJwt(token);
    return {
      meta: this.sharedService.getMeta(HttpStatus.OK),
      result: res,
    };
  }

  @AutoMessagePattern()
  public async extractUserFromToken(@Payload() token: string): Promise<UserResponse> {
    const res = await this.authService.extractUserFromJwt(token);
    return {
      meta: this.sharedService.getMeta(HttpStatus.OK),
      result: res,
    };
  }
}
