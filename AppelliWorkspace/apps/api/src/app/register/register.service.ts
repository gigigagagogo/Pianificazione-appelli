import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
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
        const user = await this.usersService.create(dto.name, dto.surname, dto.email, hashedPassword, dto.role);

        const { password: _password, ...safeUser } = user;
        return safeUser;
    }
}
