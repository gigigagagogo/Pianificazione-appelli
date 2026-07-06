import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseYear } from '../courses/course-year.entity';
import { ExamSession } from './exam-session.entity';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { HolidaysModule } from '../holidays/holidays.module';


@Module({
  imports: [TypeOrmModule.forFeature([ExamSession, CourseYear]), HolidaysModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}