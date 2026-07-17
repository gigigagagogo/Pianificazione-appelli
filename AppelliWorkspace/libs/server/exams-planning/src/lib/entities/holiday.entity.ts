import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('holidays')
export class Holiday {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date', unique: true })
  date!: string;

  @Column()
  description!: string;
}
