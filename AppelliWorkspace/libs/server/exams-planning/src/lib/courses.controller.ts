import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateMateriaDto } from './dto/create-materia.dto';

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

  @Delete(':id')
  @Roles(UserRole.SEGRETERIA)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCourse(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.deleteCourse(id);
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

  @Delete('years/:id')
  @Roles(UserRole.SEGRETERIA)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteYear(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.deleteYear(id);
  }

  // Materie di un anno di frequenza: serve al docente per precaricare la select
  // nel form di inserimento/modifica appello.
  @Get('years/:courseYearId/materie')
  findMaterie(@Param('courseYearId', ParseIntPipe) courseYearId: number) {
    return this.coursesService.findMaterieByCourseYear(courseYearId);
  }

  // La gestione (creazione) delle materie è riservata alla segreteria.
  @Post('materie')
  @Roles(UserRole.SEGRETERIA)
  createMateria(@Body() dto: CreateMateriaDto) {
    return this.coursesService.createMateria(dto);
  }
}
