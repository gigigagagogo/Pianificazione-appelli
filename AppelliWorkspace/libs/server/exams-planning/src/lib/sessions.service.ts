import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { enumerateDates, isWeekend } from './common/date.util';
import { CourseYear } from './entities/course-year.entity';
import { Appelli } from './entities/appelli.entity';
import { ExamSession } from './entities/exam-session.entity';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { UpdateExamSessionDto } from './dto/update-exam-session.dto';
import { HolidaysService } from './holidays.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(ExamSession)
    private readonly sessionsRepo: Repository<ExamSession>,
    @InjectRepository(CourseYear)
    private readonly yearsRepo: Repository<CourseYear>,
    @InjectRepository(Appelli)
    private readonly appelliRepo: Repository<Appelli>,
    private readonly holidaysService: HolidaysService,
  ) {}

  findAll() {
    return this.sessionsRepo.find({
      relations: ['courseYears', 'courseYears.course'],
      order: { sessionStartDate: 'DESC' },
    });
  }

  async findOneOrFail(id: number): Promise<ExamSession> {
    const session = await this.sessionsRepo.findOne({
      where: { id },
      relations: ['courseYears', 'courseYears.course'],
    });
    if (!session) {
      throw new NotFoundException('Sessione non trovata.');
    }
    return session;
  }

  async create(dto: CreateExamSessionDto) {
    this.validateDateRanges(
      dto.sessionStartDate,
      dto.sessionEndDate,
      new Date(dto.submissionStartDate),
      new Date(dto.submissionEndDate),
    );

    const courseYears = await this.yearsRepo.find({
      where: { id: In(dto.courseYearIds) },
    });
    if (courseYears.length !== dto.courseYearIds.length) {
      throw new BadRequestException('Uno o più corsi/anni selezionati non esistono più.');
    }
    const session = this.sessionsRepo.create({
      name: dto.name,
      sessionStartDate: dto.sessionStartDate,
      sessionEndDate: dto.sessionEndDate,
      submissionStartDate: new Date(dto.submissionStartDate),
      submissionEndDate: new Date(dto.submissionEndDate),
      courseYears,
    });
    return this.sessionsRepo.save(session);
  }

  async update(id: number, dto: UpdateExamSessionDto) {
    const session = await this.findOneOrFail(id);
    if (dto.name !== undefined) session.name = dto.name;
    if (dto.sessionStartDate !== undefined) session.sessionStartDate = dto.sessionStartDate;
    if (dto.sessionEndDate !== undefined) session.sessionEndDate = dto.sessionEndDate;
    if (dto.submissionStartDate !== undefined)
      session.submissionStartDate = new Date(dto.submissionStartDate);
    if (dto.submissionEndDate !== undefined)
      session.submissionEndDate = new Date(dto.submissionEndDate);

    this.validateDateRanges(
      session.sessionStartDate,
      session.sessionEndDate,
      session.submissionStartDate,
      session.submissionEndDate,
    );

    if (dto.courseYearIds !== undefined) {
      const courseYears = await this.yearsRepo.find({
        where: { id: In(dto.courseYearIds) },
      });
      if (courseYears.length !== dto.courseYearIds.length) {
        throw new BadRequestException('Uno o più corsi/anni selezionati non esistono più.');
      }
      session.courseYears = courseYears;
    }
    return this.sessionsRepo.save(session);
  }

  remove(id: number) {
    return this.sessionsRepo.delete(id);
  }

  private validateDateRanges(
    sessionStartDate: string,
    sessionEndDate: string,
    submissionStartDate: Date,
    submissionEndDate: Date,
  ) {
    if (sessionStartDate > sessionEndDate) {
      throw new BadRequestException(
        'La data di inizio sessione deve essere precedente alla data di fine sessione.',
      );
    }
    if (submissionStartDate > submissionEndDate) {
      throw new BadRequestException(
        "La data di inizio inserimento deve essere precedente alla data di fine inserimento.",
      );
    }
  }

  async calendar(sessionId: number, courseYearId: number, docenteId: string) {
    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId },
      relations: ['courseYears'],
    });
    if (!session) {
      throw new NotFoundException('Sessione non trovata.');
    }
    const isEnabled = session.courseYears?.some((y) => y.id === courseYearId);
    if (!isEnabled) {
      throw new NotFoundException(
        'Il corso/anno selezionato non è abilitato per questa sessione.',
      );
    }

    // Il vincolo di unicità è su (courseYear, date) a prescindere dalla sessione,
    // quindi il calendario deve considerare le prenotazioni di questo corso/anno
    // in qualunque sessione, non solo in quella che si sta visualizzando.
    const bookings = await this.appelliRepo.find({
      where: { courseYearId },
      relations: ['docente'],
    });
    const bookingByDate = new Map(bookings.map((booking) => [booking.date, booking]));

    const allDates = enumerateDates(session.sessionStartDate, session.sessionEndDate);
    const now = new Date();
    const submissionWindowOpen =
      now >= session.submissionStartDate && now <= session.submissionEndDate;

    const holidays = await this.holidaysService.getDateSet();

    const days = allDates
      .filter((date) => !isWeekend(date) && !holidays.has(date))
      .map((date) => {
        const booking = bookingByDate.get(date);
        if (!booking) {
          return { date, available: true };
        }
        return {
          date,
          available: false,
          appelloId: booking.id,
          mine: booking.docenteId === docenteId,
          docente: `${booking.docente.name} ${booking.docente.surname}`,
        };
      });

    return {
      session: {
        id: session.id,
        name: session.name,
        sessionStartDate: session.sessionStartDate,
        sessionEndDate: session.sessionEndDate,
        submissionWindowOpen,
      },
      days,
    };
  }
}
