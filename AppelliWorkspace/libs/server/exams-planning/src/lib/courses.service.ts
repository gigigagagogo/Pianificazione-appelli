import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserRole, UsersService } from '@server/users';
import { Course } from './entities/course.entity';
import { CourseYear } from './entities/course-year.entity';
import { Appelli } from './entities/appelli.entity';
import { ExamSession } from './entities/exam-session.entity';
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
    @InjectRepository(Appelli)
    private readonly appelliRepo: Repository<Appelli>,
    @InjectRepository(ExamSession)
    private readonly examSessionsRepo: Repository<ExamSession>,
    private readonly usersService: UsersService,
  ) {}

  async createCourse(dto: CreateCourseDto) {
    const course = this.coursesRepo.create(dto);
    try {
      return await this.coursesRepo.save(course);
    } catch (error) {
      throw this.mapUniqueViolation(error, 'course');
    }
  }

  async createYear(dto: CreateCourseYearDto) {
    const course = await this.coursesRepo.findOne({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException(`Corso con id ${dto.courseId} non trovato.`);
    }
    await this.assertValidDocente(dto.docenteId);
    const year = this.courseYearsRepo.create(dto);
    try {
      return await this.courseYearsRepo.save(year);
    } catch (error) {
      throw this.mapUniqueViolation(error, 'year');
    }
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
      select: {
        id: true,
        courseId: true,
        yearNumber: true,
        label: true,
        docenteId: true,
        course: { id: true, code: true, name: true },
        docente: { id: true, name: true, surname: true, email: true },
      },
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
    try {
      return await this.coursesRepo.save(course);
    } catch (error) {
      throw this.mapUniqueViolation(error, 'course');
    }
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
    try {
      return await this.courseYearsRepo.save(year);
    } catch (error) {
      throw this.mapUniqueViolation(error, 'year');
    }
  }

  async deleteCourse(id: number): Promise<void> {
    const course = await this.coursesRepo.findOne({ where: { id }, relations: ['years'] });
    if (!course) {
      throw new NotFoundException(`Corso con id ${id} non trovato.`);
    }
    if (course.years.length > 0) {
      throw new BadRequestException(
        'Impossibile eliminare il corso: elimina prima i suoi anni di frequenza.',
      );
    }
    await this.coursesRepo.remove(course);
  }

  async deleteYear(id: number): Promise<void> {
    const year = await this.courseYearsRepo.findOne({ where: { id } });
    if (!year) {
      throw new NotFoundException(`Anno di corso con id ${id} non trovato.`);
    }

    const appelliCount = await this.appelliRepo.count({ where: { courseYearId: id } });
    if (appelliCount > 0) {
      throw new BadRequestException(
        'Impossibile eliminare l\'anno di frequenza: sono già stati inseriti degli appelli per questo corso/anno.',
      );
    }

    const sessionsCount = await this.examSessionsRepo
      .createQueryBuilder('session')
      .innerJoin('session.courseYears', 'year', 'year.id = :id', { id })
      .getCount();
    if (sessionsCount > 0) {
      throw new BadRequestException(
        'Impossibile eliminare l\'anno di frequenza: è abilitato in una o più sessioni d\'esame. Rimuovilo prima dalle sessioni.',
      );
    }

    await this.courseYearsRepo.remove(year);
  }

  // Traduce la violazione del vincolo unique (Postgres 23505) in un 409 con messaggio
  // in italiano, invece di lasciarla esplodere come 500 "Errore imprevisto".
  private mapUniqueViolation(error: unknown, entity: 'course' | 'year'): Error {
    const code = (error as { driverError?: { code?: string }; code?: string })?.driverError?.code
      ?? (error as { code?: string })?.code;
    if (error instanceof QueryFailedError && code === '23505') {
      return new ConflictException(
        entity === 'course'
          ? 'Esiste già un corso di laurea con questo codice.'
          : 'Esiste già un anno di frequenza con questa etichetta.',
      );
    }
    return error as Error;
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
