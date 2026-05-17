import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  target_amount: number;

  @Column({ default: 0 })
  current_amount: number;

  @Column({ nullable: true })
  endDate: string;

  @Column({ default: 'user_placeholder' })
  user_id: string;
}
