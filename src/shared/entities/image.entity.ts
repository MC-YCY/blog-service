import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  // 文件原始名字
  @Column({
    type: 'varchar',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  originalname: string;

  // 文件原始类型
  @Column()
  mimetype: string;

  @Column()
  path: string;

  @Column('int')
  size: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @ManyToOne(() => User, (user) => user.images)
  user: User;

  @Column()
  userId: number;
}
