import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsNotEmpty()
  @IsInt()
  roleId: number;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
