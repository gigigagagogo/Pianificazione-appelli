

import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsDateString, IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

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