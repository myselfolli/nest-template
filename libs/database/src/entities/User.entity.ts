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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date | null;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
