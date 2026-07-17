import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { Appelli } from './entities/appelli.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidaysRepo: Repository<Holiday>,
    @InjectRepository(Appelli)
    private readonly appelliRepo: Repository<Appelli>,
  ) {}

  // Una festività su una data con appelli già prenotati li farebbe sparire dal
  // calendario lasciandoli però nel DB: la blocchiamo con un messaggio chiaro.
  private async assertNoAppelliOn(date: string): Promise<void> {
    const count = await this.appelliRepo.count({ where: { date } });
    if (count > 0) {
      throw new BadRequestException(
        `Impossibile impostare la festività: esistono già ${count} appelli prenotati in data ${date}.`,
      );
    }
  }

  async getDateSet(): Promise<Set<string>> {
    const all = await this.holidaysRepo.find();
    return new Set(all.map((h) => h.date));
  }

  // Mappa data → descrizione, per poter mostrare al docente il motivo per cui
  // un giorno festivo non è prenotabile (non solo escluderlo dal calendario).
  async getDateMap(): Promise<Map<string, string>> {
    const all = await this.holidaysRepo.find();
    return new Map(all.map((h) => [h.date, h.description]));
  }

  findAll(): Promise<Holiday[]> {
    return this.holidaysRepo.find({ order: { date: 'ASC' } });
  }

  async create(dto: CreateHolidayDto): Promise<Holiday> {
    const existing = await this.holidaysRepo.findOne({ where: { date: dto.date } });
    if (existing) {
      throw new BadRequestException(
        `Esiste già una festività in data ${dto.date} (${existing.description}).`,
      );
    }
    await this.assertNoAppelliOn(dto.date);
    const holiday = this.holidaysRepo.create(dto);
    return this.holidaysRepo.save(holiday);
  }

  async update(id: number, dto: UpdateHolidayDto): Promise<Holiday> {
    const holiday = await this.holidaysRepo.findOne({ where: { id } });
    if (!holiday) {
      throw new NotFoundException('Festività non trovata.');
    }
    if (dto.date && dto.date !== holiday.date) {
      const existing = await this.holidaysRepo.findOne({ where: { date: dto.date } });
      if (existing) {
        throw new BadRequestException(
          `Esiste già una festività in data ${dto.date} (${existing.description}).`,
        );
      }
      await this.assertNoAppelliOn(dto.date);
    }
    Object.assign(holiday, dto);
    return this.holidaysRepo.save(holiday);
  }

  async remove(id: number): Promise<void> {
    const holiday = await this.holidaysRepo.findOne({ where: { id } });
    if (!holiday) {
      throw new NotFoundException('Festività non trovata.');
    }
    await this.holidaysRepo.remove(holiday);
  }
}
