import { IsNotEmpty, IsString} from "class-validator";

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    code!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;
}