import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidaysRepo: Repository<Holiday>,
  ) {}

  async getDateSet(): Promise<Set<string>> {
    const all = await this.holidaysRepo.find();
    return new Set(all.map((h) => h.date));
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
