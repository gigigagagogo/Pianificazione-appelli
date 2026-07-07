import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './holiday.entity';
import { HolidaysService } from './holidays.service';

@Module({
  imports: [TypeOrmModule.forFeature([Holiday])],
  providers: [HolidaysService],
  exports: [HolidaysService],
})
export class HolidaysModule {}