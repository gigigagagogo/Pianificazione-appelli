import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ISO_DATE_REGEX } from '../common/date.util';

export class CreateExamSessionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Matches(ISO_DATE_REGEX, { message: 'La data di inizio sessione deve essere nel formato AAAA-MM-GG.' })
  sessionStartDate!: string;

  @Matches(ISO_DATE_REGEX, { message: 'La data di fine sessione deve essere nel formato AAAA-MM-GG.' })
  sessionEndDate!: string;

  @IsDateString()
  submissionStartDate!: string;

  @IsDateString()
  submissionEndDate!: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  courseYearIds!: number[];
}
