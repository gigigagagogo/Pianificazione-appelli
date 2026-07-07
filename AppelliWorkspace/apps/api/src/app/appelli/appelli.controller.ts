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
import { AppelliService } from './appelli.service';
import { CreateAppelliDto } from './dto/create-appelli.dto';
import { UpdateAppelliDto } from './dto/update-appelli.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.strategy';

@Controller('appelli')
export class AppelliController {
  constructor(private readonly appelliService: AppelliService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createAppelliDto: CreateAppelliDto, @Req() req: Request) {
    const docente = req.user as JwtPayload;
    return this.appelliService.create(createAppelliDto, docente.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.appelliService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@Req() req: Request) {
    const docente = req.user as JwtPayload;
    return this.appelliService.findMine(docente.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appelliService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppelliDto: UpdateAppelliDto,
    @Req() req: Request,
  ) {
    const docente = req.user as JwtPayload;
    return this.appelliService.update(+id, updateAppelliDto, docente.sub);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const docente = req.user as JwtPayload;
    return this.appelliService.remove(+id, docente.sub);
  }
}
