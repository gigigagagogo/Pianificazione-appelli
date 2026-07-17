import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ISO_DATE_REGEX } from '../common/date.util';

export class CreateHolidayDto {
  @Matches(ISO_DATE_REGEX, { message: 'La data deve essere nel formato AAAA-MM-GG.' })
  date!: string;

  @IsString({ message: 'La descrizione deve essere un testo.' })
  @IsNotEmpty({ message: 'La descrizione è obbligatoria.' })
  description!: string;
}
