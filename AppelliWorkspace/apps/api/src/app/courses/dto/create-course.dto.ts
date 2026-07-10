import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString({ message: 'Il codice deve essere un testo.' })
  @IsNotEmpty({ message: 'Il codice è obbligatorio.' })
  code!: string;

  @IsString({ message: 'Il nome deve essere un testo.' })
  @IsNotEmpty({ message: 'Il nome è obbligatorio.' })
  name!: string;
}