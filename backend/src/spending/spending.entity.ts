import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('spending')
export class Spending {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column()
  amount: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  time: string;

  @Column({ nullable: true })
  period: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: 'user_placeholder' })
  user_id: string;
}
