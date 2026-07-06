import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './holiday.entity';

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
}