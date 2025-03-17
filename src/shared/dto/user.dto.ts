import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsUUID,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(16)
  account: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(16)
  password: string;

  @MinLength(6)
  @MaxLength(16)
  username: string;

  @IsNotEmpty()
  avatar?: string;

  @IsOptional()
  @IsUUID()
  avatarId?: string;

  @IsNotEmpty()
  @IsString()
  captchaId: string; // 新增：验证码 ID

  @IsNotEmpty()
  @IsString()
  captchaCode: string; // 新增：验证码值

  @IsNotEmpty({ message: '角色ID不能为空' })
  @IsInt({ message: '角色ID必须是整数' })
  roleId: number;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(16)
  account: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(16)
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
  @MinLength(6)
  @MaxLength(16)
  account?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(16)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(16)
  password?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt()
  roleId?: number; // 新增角色ID字段
}
