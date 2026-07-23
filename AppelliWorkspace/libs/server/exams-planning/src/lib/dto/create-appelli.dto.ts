import { IsInt, Matches } from 'class-validator';
import { ISO_DATE_REGEX } from '../common/date.util';

export class CreateAppelliDto {
  @Matches(ISO_DATE_REGEX, { message: 'La data deve essere nel formato AAAA-MM-GG.' })
  date!: string;

  @IsInt()
  courseYearId!: number;

  @IsInt()
  materiaId!: number;

  @IsInt()
  examSessionId!: number;
}
