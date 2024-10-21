import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    description: 'The user\'s email address',
    example: 'email@hello.world',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The user\'s password',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterRequest {
  @ApiProperty({
    description: 'The user\'s email address',
    example: 'email@hello.world',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The user\'s password',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
