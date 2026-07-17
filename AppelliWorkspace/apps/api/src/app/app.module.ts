import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@appelli-workspace/database';
import { UsersModule } from '@server/users';
import { AuthModule } from '@server/auth';
import { ExamsPlanningModule } from '@server/exams-planning';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, ExamsPlanningModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
