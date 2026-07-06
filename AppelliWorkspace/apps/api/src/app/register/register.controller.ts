import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterDto } from './dto/register.dto';

@Controller('register')
export class RegisterController {

    constructor(private readonly registerService: RegisterService) {}

    @Post()
    async registerUser(@Body() dto: RegisterDto) {
        return this.registerService.registerUser(dto);
    }

}
