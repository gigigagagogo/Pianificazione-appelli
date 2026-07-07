import { PartialType } from '@nestjs/mapped-types';
import { CreateAppelliDto } from './create-appelli.dto';

export class UpdateAppelliDto extends PartialType(CreateAppelliDto) {}
