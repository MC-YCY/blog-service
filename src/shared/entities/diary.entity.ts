import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Diary {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  username: string;
  @Column({ type: 'text' })
  content: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
