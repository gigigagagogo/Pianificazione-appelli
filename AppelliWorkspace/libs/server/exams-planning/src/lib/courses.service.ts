import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole, UsersService } from '@server/users';
import { Course } from './entities/course.entity';
import { CourseYear } from './entities/course-year.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseYearDto } from './dto/create-course-year.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseYearDto } from './dto/update-course-year.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepo: Repository<Course>,
    @InjectRepository(CourseYear)
    private readonly courseYearsRepo: Repository<CourseYear>,
    private readonly usersService: UsersService,
  ) {}

  createCourse(dto: CreateCourseDto) {
    const course = this.coursesRepo.create(dto);
    return this.coursesRepo.save(course);
  }

  async createYear(dto: CreateCourseYearDto) {
    const course = await this.coursesRepo.findOne({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException(`Corso con id ${dto.courseId} non trovato.`);
    }
    await this.assertValidDocente(dto.docenteId);
    const year = this.courseYearsRepo.create(dto);
    return this.courseYearsRepo.save(year);
  }

  findAllCourses() {
    return this.coursesRepo.find({
      relations: ['years'],
      order: { name: 'ASC' },
    });
  }

  findAllYears() {
    return this.courseYearsRepo.find({
      relations: ['course', 'docente'],
      order: { yearNumber: 'ASC' },
    });
  }

  findMineYears(docenteId: string) {
    return this.courseYearsRepo.find({
      where: { docenteId },
      relations: ['course'],
      order: { yearNumber: 'ASC' },
    });
  }

  async updateCourse(id: number, dto: UpdateCourseDto) {
    const course = await this.coursesRepo.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Corso con id ${id} non trovato.`);
    }
    Object.assign(course, dto);
    return this.coursesRepo.save(course);
  }

  async updateYear(id: number, dto: UpdateCourseYearDto) {
    const year = await this.courseYearsRepo.findOne({ where: { id } });
    if (!year) {
      throw new NotFoundException(`Anno di corso con id ${id} non trovato.`);
    }
    if (dto.courseId !== undefined) {
      const course = await this.coursesRepo.findOne({ where: { id: dto.courseId } });
      if (!course) {
        throw new NotFoundException(`Corso con id ${dto.courseId} non trovato.`);
      }
    }
    if (dto.docenteId !== undefined) {
      await this.assertValidDocente(dto.docenteId);
    }
    Object.assign(year, dto);
    return this.courseYearsRepo.save(year);
  }

  private async assertValidDocente(docenteId?: string): Promise<void> {
    if (!docenteId) {
      return;
    }
    const user = await this.usersService.findById(docenteId);
    if (!user || user.role !== UserRole.DOCENTE) {
      throw new BadRequestException('Il docente selezionato non è valido.');
    }
  }
}
