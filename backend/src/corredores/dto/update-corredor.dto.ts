import { PartialType } from '@nestjs/mapped-types';
import { CreateCorredorDto } from './create-corredor.dto';

export class UpdateCorredorDto extends PartialType(CreateCorredorDto) {}
