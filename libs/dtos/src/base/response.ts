import { User } from '@database/entities';
import { HttpStatus } from '@nestjs/common';

export class GeneralBooleanResponse implements IResponse<boolean> {
  meta: IMeta;
  result: boolean;
}

export class GeneralStringResponse implements IResponse<string> {
  meta: IMeta;
  result: string;
}

export class GeneralNumberResponse implements IResponse<number> {
  meta: IMeta;
  result: number;
}

export interface IResponse<T = unknown> {
  meta: IMeta;
  result: T;
}

export interface IMeta {
  statusCode: HttpStatus;
  success: boolean;
  resCount: number;
  message?: string;
  additionalInformation?: unknown;
}

export class RequestWithUser {
  user: User;
}
