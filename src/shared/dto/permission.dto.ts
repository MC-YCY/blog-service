import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PermissionType } from '../entities/permission.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PermissionType)
  type: PermissionType;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
