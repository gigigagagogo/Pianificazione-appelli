import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name!: string;

  @IsString()
  surname!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, {
    message: 'La password deve contenere almeno una lettera maiuscola',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'La password deve contenere almeno un numero',
  })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'La password deve contenere almeno un carattere speciale',
  })
  password!: string;
}
