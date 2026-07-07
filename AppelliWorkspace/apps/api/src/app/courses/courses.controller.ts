import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseYearDto } from './dto/create-course-year.dto';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/user-role.enum';
import { Roles } from '../auth/roles.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAllCourses() {
    return this.coursesService.findAllCourses();
  }

  @Post()
  @Roles(UserRole.SEGRETERIA)
  createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto);
  }

  @Get('years')
  findAllYears() {
    return this.coursesService.findAllYears();
  }

  @Post('years')
  @Roles(UserRole.SEGRETERIA)
  createYear(@Body() dto: CreateCourseYearDto) {
    return this.coursesService.createYear(dto);
  }
}