import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { Role } from './role.entity';
import { ValidateIf, IsNotEmpty } from 'class-validator';

@Entity()
@Tree('closure-table') // 使用闭包表实现树形结构
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column()
  component: string;

  @Column({
    type: 'enum',
    enum: ['menu', 'button'],
    default: 'menu',
  })
  type: 'menu' | 'button';

  @Column({ nullable: true })
  icon?: string;

  @ValidateIf((o: Menu) => o.type === 'button') // 当 type 为 button 时，code 必填
  @IsNotEmpty({ message: '按钮类型必须填写权限码' })
  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  explain?: string;

  @TreeParent() // 父菜单
  parent: Menu | null;

  @TreeChildren({ cascade: true }) // 子菜单列表
  children: Menu[] | null;

  @ManyToMany(() => Role, (role) => role.menus) // 与角色的多对多关系
  roles: Role[];
}
