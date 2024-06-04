import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SharedService } from '@shared';
import { AuthController } from 'apps/auth/src/auth.controller';
import { Request } from 'express';

export class UserGuard implements CanActivate {
  constructor(
    private readonly sharedService: SharedService,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // extract the bearer token from the request headers
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    // call the auth service to validate the token
    const isValid = await this.sharedService.internalMicroserviceCall(
      this.authService,
      AuthController.prototype['validateToken'],
      token,
    );

    if (!isValid) {
      return false;
    }

    request.user = await this.sharedService.internalMicroserviceCall(
      this.authService,
      AuthController.prototype['extractUserFromToken'],
      token,
    );

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
