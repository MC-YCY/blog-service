import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column({ type: 'int', default: 0 })
  count: number;
}
