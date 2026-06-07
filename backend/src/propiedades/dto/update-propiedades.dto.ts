import { PartialType } from '@nestjs/mapped-types';
import { CreatePropiedadesDto } from './create-propiedades.dto';

export class UpdatePropiedadesDto extends PartialType(
  CreatePropiedadesDto,
) {}