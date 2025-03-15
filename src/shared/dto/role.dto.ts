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
