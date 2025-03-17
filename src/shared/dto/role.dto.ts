import {
  IsIn,
  IsInt,
  isNotEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}

export class UpdateRoleDto extends CreateRoleDto {
  @IsString()
  id: number;
}

// DTO：分配资源（菜单）给角色
export class AssignResourcesDto {
  // 角色ID
  roleId: number;
  // 资源ID集合，例如菜单ID数组
  resourceIds: number[];
}

export class RoleUsersPaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['id', 'createdAt', 'username']) // 根据实际字段调整
  orderBy?: keyof User = 'id';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';
}
