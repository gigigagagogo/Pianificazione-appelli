import { IsDateString, IsInt } from 'class-validator';

export class CreateAppelliDto {
  @IsDateString()
  date!: string;

  @IsInt()
  courseYearId!: number;

  @IsInt()
  examSessionId!: number;
}
