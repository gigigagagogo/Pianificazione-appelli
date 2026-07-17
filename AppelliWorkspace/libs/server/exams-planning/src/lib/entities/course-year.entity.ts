import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '@server/users';
import { Course } from './course.entity';

@Entity('course_years')
export class CourseYear {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'course_id' })
  courseId!: number;

  @ManyToOne(() => Course, (course) => course.years, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ name: 'year_number' })
  yearNumber!: number;

  @Column({ unique: true })
  label!: string;

  @Column({ name: 'docente_id', nullable: true })
  docenteId?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'docente_id' })
  docente?: User | null;
}
