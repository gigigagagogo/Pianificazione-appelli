import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CourseYear } from './course-year.entity';

@Entity('materie')
@Unique(['courseYear', 'name']) // niente due materie con lo stesso nome nello stesso anno di frequenza
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
}
