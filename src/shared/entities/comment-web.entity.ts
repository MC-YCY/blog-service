import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('comments-web')
export class CommentWeb {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  qq: string;

  @Column()
  avatar: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  email: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => CommentWeb, (comment) => comment.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: CommentWeb | null;

  @Column({ nullable: true })
  parentId?: number;

  @OneToMany(() => CommentWeb, (comment) => comment.parent)
  children?: CommentWeb[];

  @Column({ nullable: true })
  replyTo?: string;
}
