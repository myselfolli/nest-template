import { User } from '@database/entities';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export abstract class IMeta {
  @ApiProperty(
    {
      enum: HttpStatus,
      default: HttpStatus.OK,
      description: 'HTTP status code of the response',
    }
  )
  statusCode: HttpStatus;

  @ApiProperty({
    default: true,
    description: 'Indicates if the request was successful',
  })
  success: boolean;

  @ApiProperty({
    description: 'Number of results returned',
    default: 1,
  })
  resCount: number;

  @ApiPropertyOptional({
    description: 'Message returned by the server',
    default: '',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Additional information returned by the server',
    default: {},
  })
  additionalInformation?: unknown;
}

export class GeneralBooleanResponse implements IResponse<boolean> {
  meta: IMeta;
  result: boolean;
}

export class GeneralStringResponse implements IResponse<string> {
  @ApiProperty({
    type: IMeta,
    description: 'Metadata of the response',
  })
  meta: IMeta;

  @ApiProperty({
    description: 'String result of the request',
  })
  result: string;
}

export class GeneralNumberResponse implements IResponse<number> {
  @ApiProperty({
    type: IMeta,
    description: 'Metadata of the response',
  })
  meta: IMeta;

  @ApiProperty({
    description: 'Number result of the request',
  })
  result: number;
}

export interface IResponse<T = unknown> {
  meta: IMeta;
  result: T;
}

export class RequestWithUser {
  user: User;
}
