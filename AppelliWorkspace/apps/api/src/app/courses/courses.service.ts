import{Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import { Course } from './course.entity';
import { CourseYear } from './course-year.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseYearDto } from './dto/create-course-year.dto';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course)
        private readonly coursesRepo: Repository<Course>,
        @InjectRepository(CourseYear)
        private readonly courseYearsRepo: Repository<CourseYear>
    ) {}

    createCourse(dto:CreateCourseDto){
        const course = this.coursesRepo.create(dto);
        return this.coursesRepo.save(course);   
    }

    async createYear(dto: CreateCourseYearDto){
        const course = await this.coursesRepo.findOne({where: { id: dto.courseId}});
        if(!course){
            throw new NotFoundException(`Course with id ${dto.courseId} not found`);
        }
        const year = this.courseYearsRepo.create(dto);
        return this.courseYearsRepo.save(year); 
    }

    findAllCourses(){
        return this.coursesRepo.find({
            relations: ['years'],
            order: {name: 'ASC'} 
        });
    }

    findAllYears(){
        return this.courseYearsRepo.find({
            relations: ['course'],
            order: {yearNumber: 'ASC'} 
        });      
    }
}