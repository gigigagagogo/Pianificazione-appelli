import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseYearDto } from './create-course-year.dto';

export class UpdateCourseYearDto extends PartialType(CreateCourseYearDto) {}
