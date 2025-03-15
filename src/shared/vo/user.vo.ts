import { Role } from '../entities/role.entity';

export class UserVo {
  account: string;
  id: number;
  avatar: string;
  role: Role;
}
