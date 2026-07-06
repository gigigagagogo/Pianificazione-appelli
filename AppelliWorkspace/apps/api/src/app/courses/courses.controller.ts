import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseYearDto } from './dto/create-course-year.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAllCourses() {
    return this.coursesService.findAllCourses();
  }

  @Post()
  createCourse(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto);
  }

  @Get('years')
  findAllYears() {
    return this.coursesService.findAllYears();
  }

  @Post('years')
  createYear(@Body() dto: CreateCourseYearDto) {
    return this.coursesService.createYear(dto);
  }
}