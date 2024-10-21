import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 't_user' })
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'The user\'s unique identifier',
    example: 1,
  })
  id: number;

  @Column({ type: 'text', name: 'email', unique: true })
  @ApiProperty({
    description: 'The user\'s email address',
    example: 'test@hello.world',
  })
  email: string;

  @Column({ type: 'text', name: 'password' })
  password: string;

  @CreateDateColumn()
  @ApiProperty({
    description: 'The date and time the user was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'The date and time the user was last updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({
    description: 'The date and time the user was deleted',
    example: 'null',
  })
  deletedAt: Date | null;
}
