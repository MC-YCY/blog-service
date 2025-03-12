import { Role } from '../entities/role.entity';

export class UserVo {
  username: string;
  id: number;
  avatar: string;
  role: Role;
}
