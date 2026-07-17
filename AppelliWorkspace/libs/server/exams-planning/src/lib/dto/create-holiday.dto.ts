import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateHolidayDto {
  @IsDateString({}, { message: 'La data deve essere nel formato AAAA-MM-GG.' })
  date!: string;

  @IsString({ message: 'La descrizione deve essere un testo.' })
  @IsNotEmpty({ message: 'La descrizione è obbligatoria.' })
  description!: string;
}
