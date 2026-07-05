import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCourseYearDto {
  @IsInt()
  courseId!: number;

  @IsInt()
  @Min(1)
  yearNumber!: number;

  @IsString()
  @IsNotEmpty()
  label!: string;
}