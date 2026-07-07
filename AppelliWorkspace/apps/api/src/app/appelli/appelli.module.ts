import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppelliService } from './appelli.service';
import { AppelliController } from './appelli.controller';
import { Appelli } from './appelli.entity';
import { ExamSession } from '../sessions/exam-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appelli, ExamSession])],
  controllers: [AppelliController],
  providers: [AppelliService],
})
export class AppelliModule {}
