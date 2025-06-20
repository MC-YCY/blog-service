import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentWebDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  qq?: string;

  @IsString()
  avatar: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  parentId?: number;

  @IsOptional()
  @IsString()
  replyTo?: string;
}
