import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { CourseYear } from '../courses/course-year.entity';
import { ExamSession } from '../sessions/exam-session.entity';

@Entity('appelli')
@Unique(['courseYear', 'date'])
export class Appelli {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'docente_id' })
  docenteId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'docente_id' })
  docente!: User;

  @Column({ name: 'course_year_id' })
  courseYearId!: number;

  @ManyToOne(() => CourseYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_year_id' })
  courseYear!: CourseYear;

  @ManyToOne(() => ExamSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_session_id' })
  examSession!: ExamSession;

  @CreateDateColumn()
  createdAt!: Date;
}
