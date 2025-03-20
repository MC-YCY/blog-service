import { Role } from '../entities/role.entity';

export class UserVo {
  account: string;
  username: string;
  signature: string;
  id: number;
  avatar: string;
  role: Role;
}
