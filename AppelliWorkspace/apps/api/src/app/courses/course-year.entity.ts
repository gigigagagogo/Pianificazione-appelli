import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

    @Column({unique: true})
    label!: string;
}