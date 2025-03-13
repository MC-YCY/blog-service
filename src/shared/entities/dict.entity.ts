import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Dict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '字典名称（如：用户状态）' })
  name: string;

  @Column({
    unique: true,
    comment: '字典类型（唯一标识符，如：user_status）',
  })
  type: string;

  @Column({
    type: 'json',
    comment: '字典键值对（如：[{ label: "激活", value: 1 }]',
  })
  entries: Array<{ label: string; value: string | number }>;

  @Column({
    default: true,
    comment: '是否启用',
  })
  status: boolean;

  @Column({
    default: 0,
    comment: '排序值',
  })
  sort: number;

  @Column({
    nullable: true,
    comment: '备注说明',
  })
  remark: string;
}
