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
  @IsString()
  captchaId: string; // 新增：验证码 ID

  @IsNotEmpty()
  @IsString()
  captchaCode: string; // 新增：验证码值
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  captchaId: string; // 新增：验证码 ID

  @IsNotEmpty()
  @IsString()
  captchaCode: string; // 新增：验证码值
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
