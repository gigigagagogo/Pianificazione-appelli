import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard, RolesGuard, Roles } from '@server/security';
import { UserRole } from '@server/users';
import { JwtPayload } from '@server/auth';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseYearDto } from './dto/create-course-year.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseYearDto } from './dto/update-course-year.dto';

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

  @Patch(':id')
  @Roles(UserRole.SEGRETERIA)
  updateCourse(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto);
  }

  @Get('years')
  findAllYears() {
    return this.coursesService.findAllYears();
  }

  @Get('years/mine')
  @Roles(UserRole.DOCENTE)
  findMineYears(@Req() req: Request) {
    const docente = req.user as JwtPayload;
    return this.coursesService.findMineYears(docente.sub);
  }

  @Post('years')
  @Roles(UserRole.SEGRETERIA)
  createYear(@Body() dto: CreateCourseYearDto) {
    return this.coursesService.createYear(dto);
  }

  @Patch('years/:id')
  @Roles(UserRole.SEGRETERIA)
  updateYear(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseYearDto) {
    return this.coursesService.updateYear(id, dto);
  }
}
