import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMateriaDto {
  @IsString({ message: 'Il nome della materia deve essere un testo.' })
  @IsNotEmpty({ message: 'Il nome della materia è obbligatorio.' })
  name!: string;

  @IsInt({ message: 'Seleziona un anno di frequenza valido.' })
  courseYearId!: number;

  @IsOptional()
  @IsUUID('4', { message: 'Il docente selezionato non è valido.' })
  docenteId?: string | null;
}
