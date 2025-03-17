import { isNotEmpty, IsNotEmpty, IsString } from 'class-validator';

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