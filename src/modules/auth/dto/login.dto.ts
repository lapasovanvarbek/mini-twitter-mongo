import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  usernameOrEmail: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;
}
