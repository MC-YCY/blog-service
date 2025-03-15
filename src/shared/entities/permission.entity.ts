import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  description: string;

  @Column({ unique: true })
  code: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'role_permissions', // 自定义中间表名（可选）
    joinColumn: { name: 'permission_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];
}
