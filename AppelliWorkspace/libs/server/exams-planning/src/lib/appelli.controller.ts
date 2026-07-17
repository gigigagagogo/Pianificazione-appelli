import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard, RolesGuard, Roles } from '@server/security';
import { UserRole } from '@server/users';
import { JwtPayload } from '@server/auth';
import { AppelliService } from './appelli.service';
import { CreateAppelliDto } from './dto/create-appelli.dto';
import { UpdateAppelliDto } from './dto/update-appelli.dto';

@Controller('appelli')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppelliController {
  constructor(private readonly appelliService: AppelliService) {}

  @Post()
  @Roles(UserRole.DOCENTE)
  create(@Body() createAppelliDto: CreateAppelliDto, @Req() req: Request) {
    const docente = req.user as JwtPayload;
    return this.appelliService.create(createAppelliDto, docente.sub);
  }

  @Get()
  findAll() {
    return this.appelliService.findAll();
  }

  @Get('mine')
  findMine(@Req() req: Request) {
    const docente = req.user as JwtPayload;
    return this.appelliService.findMine(docente.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appelliService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCENTE)
  update(
    @Param('id') id: string,
    @Body() updateAppelliDto: UpdateAppelliDto,
    @Req() req: Request,
  ) {
    const docente = req.user as JwtPayload;
    return this.appelliService.update(+id, updateAppelliDto, docente.sub);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @Roles(UserRole.DOCENTE)
  remove(@Param('id') id: string, @Req() req: Request) {
    const docente = req.user as JwtPayload;
    return this.appelliService.remove(+id, docente.sub);
  }
}
