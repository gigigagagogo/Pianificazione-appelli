import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { isWeekend } from './common/date.util';
import { Appelli } from './entities/appelli.entity';
import { ExamSession } from './entities/exam-session.entity';
import { CreateAppelliDto } from './dto/create-appelli.dto';
import { UpdateAppelliDto } from './dto/update-appelli.dto';

@Injectable()
export class AppelliService {
  constructor(
    @InjectRepository(Appelli)
    private readonly appelliRepository: Repository<Appelli>,
    @InjectRepository(ExamSession)
    private readonly examSessionRepository: Repository<ExamSession>,
  ) {}

  async create(dto: CreateAppelliDto, docenteId: string): Promise<Appelli> {
    await this.validateBooking(dto.examSessionId, dto.courseYearId, dto.date);
    await this.assertDateFree(dto.courseYearId, dto.date);

    const appello = this.appelliRepository.create({
      date: dto.date,
      docenteId,
      courseYearId: dto.courseYearId,
      examSession: { id: dto.examSessionId },
    });

    try {
      return await this.appelliRepository.save(appello);
    } catch (error) {
      throw new ConflictException(
        'Esiste già un appello in questa data per questo corso di laurea/anno di frequenza',
      );
    }
  }

  findAll() {
    return this.appelliRepository.find({
      relations: ['courseYear', 'courseYear.course', 'examSession', 'docente'],
      select: {
        id: true,
        date: true,
        docenteId: true,
        courseYearId: true,
        createdAt: true,
        courseYear: {
          id: true,
          yearNumber: true,
          label: true,
          course: { id: true, code: true, name: true },
        },
        examSession: { id: true, name: true, sessionStartDate: true, sessionEndDate: true },
        docente: { id: true, name: true, surname: true },
      },
      order: { date: 'ASC' },
    });
  }

  findMine(docenteId: string) {
    return this.appelliRepository.find({
      where: { docenteId },
      relations: ['courseYear', 'courseYear.course', 'examSession'],
      order: { date: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.appelliRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateAppelliDto, docenteId: string): Promise<Appelli> {
    const appello = await this.findOwnedOrFail(id, docenteId);

    const examSessionId = dto.examSessionId ?? appello.examSession.id;
    const courseYearId = dto.courseYearId ?? appello.courseYearId;
    const date = dto.date ?? appello.date;

    await this.validateBooking(examSessionId, courseYearId, date);
    await this.assertDateFree(courseYearId, date, id);

    appello.date = date;
    appello.courseYearId = courseYearId;
    appello.examSession = { id: examSessionId } as ExamSession;

    try {
      return await this.appelliRepository.save(appello);
    } catch (error) {
      throw new ConflictException(
        'Esiste già un appello in questa data per questo corso di laurea/anno di frequenza',
      );
    }
  }

  async remove(id: number, docenteId: string): Promise<void> {
    const appello = await this.findOwnedOrFail(id, docenteId);

    const session = await this.examSessionRepository.findOne({
      where: { id: appello.examSession.id },
    });
    if (session) {
      const now = new Date();
      if (now < session.submissionStartDate || now > session.submissionEndDate) {
        throw new BadRequestException(
          'Il periodo per modificare o cancellare gli appelli di questa sessione non è aperto',
        );
      }
    }

    await this.appelliRepository.remove(appello);
  }

  private async findOwnedOrFail(id: number, docenteId: string): Promise<Appelli> {
    const appello = await this.appelliRepository.findOne({
      where: { id },
      relations: ['examSession'],
    });
    if (!appello) {
      throw new NotFoundException('Appello non trovato');
    }
    if (appello.docenteId !== docenteId) {
      throw new ForbiddenException("Non puoi modificare l'appello di un altro docente");
    }
    return appello;
  }

  private async validateBooking(
    examSessionId: number,
    courseYearId: number,
    date: string,
  ): Promise<ExamSession> {
    const session = await this.examSessionRepository.findOne({
      where: { id: examSessionId },
      relations: ['courseYears'],
    });

    if (!session) {
      throw new NotFoundException('Sessione di esami non trovata');
    }

    const now = new Date();
    if (now < session.submissionStartDate || now > session.submissionEndDate) {
      throw new BadRequestException(
        'Il periodo per inserire o modificare gli appelli di questa sessione non è aperto',
      );
    }

    if (date < session.sessionStartDate || date > session.sessionEndDate) {
      throw new BadRequestException('La data scelta è fuori dal periodo della sessione');
    }

    if (isWeekend(date)) {
      throw new BadRequestException('Non è possibile inserire un appello di sabato o domenica');
    }

    const belongsToSession = session.courseYears?.some(
      (courseYear) => courseYear.id === courseYearId,
    );
    if (!belongsToSession) {
      throw new BadRequestException(
        'Questo corso di laurea/anno di frequenza non fa parte di questa sessione',
      );
    }

    return session;
  }

  private async assertDateFree(
    courseYearId: number,
    date: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.appelliRepository.findOne({
      where: {
        courseYearId,
        date,
        ...(excludeId !== undefined ? { id: Not(excludeId) } : {}),
      },
    });
    if (existing) {
      throw new ConflictException(
        'Esiste già un appello in questa data per questo corso di laurea/anno di frequenza',
      );
    }
  }
}
