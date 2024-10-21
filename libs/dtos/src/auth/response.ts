import { User } from '@database/entities';
import { IMeta, IResponse } from '@dtos/base/response';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponse implements IResponse<User> {
  @ApiProperty({
    type: IMeta,
    description: 'The metadata of the response',
  })
  meta: IMeta;

  @ApiProperty({
    type: User,
    description: 'The returned user data',
  })
  result: User;
}
