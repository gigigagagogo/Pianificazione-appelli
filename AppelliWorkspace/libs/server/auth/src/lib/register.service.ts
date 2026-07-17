import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UsersService } from '@server/users';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class RegisterService {
  constructor(private readonly usersService: UsersService) {}

  async registerUser(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    // La registrazione pubblica crea solo docenti: gli account segreteria
    // vengono creati dal seed o da un'altra segreteria.
    const user = await this.usersService.create(
      dto.name,
      dto.surname,
      dto.email,
      hashedPassword,
      UserRole.DOCENTE,
    );

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
