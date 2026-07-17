import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard, RolesGuard, Roles } from '@server/security';
import { UserRole } from '@server/users';
import { JwtPayload } from '@server/auth';
import { CreateExamSessionDto } from './dto/create-exam-session.dto';
import { UpdateExamSessionDto } from './dto/update-exam-session.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOneOrFail(id);
  }

  @Get(':id/calendar')
  calendar(
    @Param('id', ParseIntPipe) id: number,
    @Query('courseYearId', ParseIntPipe) courseYearId: number,
    @Req() req: Request,
  ) {
    const docente = req.user as JwtPayload;
    return this.sessionsService.calendar(id, courseYearId, docente.sub);
  }

  @Post()
  @Roles(UserRole.SEGRETERIA)
  create(@Body() dto: CreateExamSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SEGRETERIA)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExamSessionDto) {
    return this.sessionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SEGRETERIA)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.remove(id);
  }
}
