import { User } from '@database/entities';
import { IMeta, IResponse } from '@dtos/base/response';

export class UserResponse implements IResponse<User> {
  meta: IMeta;
  result: User;
}
