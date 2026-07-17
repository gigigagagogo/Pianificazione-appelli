import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@server/users';
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
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, CourseYear, ExamSession, Appelli, Holiday]),
    UsersModule,
  ],
  controllers: [CoursesController, SessionsController, AppelliController, HolidaysController],
  providers: [CoursesService, SessionsService, AppelliService, HolidaysService],
})
export class ExamsPlanningModule {}
