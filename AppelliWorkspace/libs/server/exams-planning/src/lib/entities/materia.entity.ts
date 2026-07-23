import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '@server/users';
import { CourseYear } from './course-year.entity';

@Entity('materie')
@Unique(['courseYear', 'name']) // una materia è unica nell'anno: due docenti non possono averla entrambi
export class Materia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: 'course_year_id' })
  courseYearId!: number;

  @ManyToOne(() => CourseYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_year_id' })
  courseYear!: CourseYear;

  @Column({ name: 'docente_id', nullable: true })
  docenteId?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'docente_id' })
  docente?: User | null;
}
