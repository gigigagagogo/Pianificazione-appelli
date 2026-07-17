import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role },
      select: { id: true, name: true, surname: true, email: true },
      order: { surname: 'ASC' },
    });
  }

  async create(
    name: string,
    surname: string,
    email: string,
    hashedPassword: string,
    role: UserRole,
  ): Promise<User> {
    const user = this.usersRepository.create({
      name,
      surname,
      email,
      password: hashedPassword,
      role,
    });
    return this.usersRepository.save(user);
  }
}
