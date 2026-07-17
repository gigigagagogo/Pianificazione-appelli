import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseYear } from './entities/course-year.entity';
import { ExamSession } from './entities/exam-session.entity';
import { Appelli } from './entities/appelli.entity';
import { Holiday } from './entities/holiday.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { AppelliController } from './appelli.controller';
import { AppelliService } from './appelli.service';
import { HolidaysService } from './holidays.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseYear, ExamSession, Appelli, Holiday]),
  ],
  controllers: [CoursesController, SessionsController, AppelliController],
  providers: [CoursesService, SessionsService, AppelliService, HolidaysService],
})
export class ExamsPlanningModule {}
