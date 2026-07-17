import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateExamSessionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  sessionStartDate!: string;

  @IsDateString()
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
