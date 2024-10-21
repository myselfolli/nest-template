import { Body, Controller, Get, HttpStatus, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SharedService } from '@shared';
import { GeneralStringResponse, LoginRequest, RegisterRequest, RequestWithUser, UserResponse } from '@dtos';
import { AuthController as MSAuthController } from 'apps/auth/src/auth.controller';
import { UserGuard } from '../guards/user.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly sharedService: SharedService,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  @Post('login')
  @ApiOkResponse({ type: GeneralStringResponse }) 
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid request payload' })
  async login(@Body() body: LoginRequest): Promise<GeneralStringResponse> {
    return this.sharedService.microserviceCall(this.authService, MSAuthController.prototype['login'], body);
  }

  @Post('register')
  @ApiOkResponse({ type: GeneralStringResponse })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiBadRequestResponse({ description: 'Invalid request payload' })
  async register(@Body() body: RegisterRequest): Promise<GeneralStringResponse> {
    return this.sharedService.microserviceCall(this.authService, MSAuthController.prototype['register'], body);
  }

  @UseGuards(UserGuard)
  @ApiOkResponse({ type: UserResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized User' })
  @ApiBearerAuth()
  @Get('me')
  async getAuthenticatedUser(@Req() request: RequestWithUser): Promise<UserResponse> {
    return {
      meta: this.sharedService.getMeta(HttpStatus.OK),
      result: request.user,
    };
  }
}
