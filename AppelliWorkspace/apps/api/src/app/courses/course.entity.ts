import{Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { CourseYear } from "./course-year.entity";

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true }) //garantisce che non si possono salvare due corsi con lo stesso codice
  code!: string;

  @Column()
  name!: string;

  @OneToMany(() =>CourseYear, (year) => year.course)
  years!: CourseYear[];
}
