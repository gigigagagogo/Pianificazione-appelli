import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { CourseYear } from "../courses/course-year.entity";

@Entity('exam_sessions')
export class ExamSession {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ name: 'session_start_date', type: 'date' })
    sessionStartDate!: string;

    @Column({ name: 'session_end_date', type: 'date' })
    sessionEndDate!: string;

    @Column({ name: 'submission_start_date', type: 'timestamptz' })
    submissionStartDate!: Date;

    @Column({ name: 'submission_end_date', type: 'timestamptz' })
    submissionEndDate!: Date;

    @ManyToMany(() => CourseYear)
    @JoinTable({
        name: 'exam_session_course_years',
        joinColumn: { name: 'exam_session_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'course_year_id', referencedColumnName: 'id' },
    })
    courseYears?: CourseYear[];
}