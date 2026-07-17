import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@server/security';
import { UsersService } from './users.service';
import { UserRole } from './user-role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('docenti')
  @Roles(UserRole.SEGRETERIA)
  findDocenti() {
    return this.usersService.findByRole(UserRole.DOCENTE);
  }
}
