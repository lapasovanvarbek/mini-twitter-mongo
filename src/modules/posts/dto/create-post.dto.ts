import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsMongoId } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'Hello World! #NestJS @johndoe',
    maxLength: 280,
  })
  @IsString()
  @MaxLength(280, { message: 'Post content cannot exceed 280 characters' })
  content: string;

  @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsMongoId()
  replyToPostId?: string;
}
