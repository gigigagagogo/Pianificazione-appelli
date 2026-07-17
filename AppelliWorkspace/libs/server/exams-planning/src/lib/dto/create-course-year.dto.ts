import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCourseYearDto {
  @IsInt({ message: 'Seleziona un corso di laurea valido.' })
  courseId!: number;

  @IsInt({ message: 'Il numero anno deve essere un numero intero.' })
  @Min(1, { message: 'Il numero anno deve essere almeno 1.' })
  yearNumber!: number;

  @IsString({ message: "L'etichetta deve essere un testo." })
  @IsNotEmpty({ message: "L'etichetta è obbligatoria." })
  label!: string;
}
