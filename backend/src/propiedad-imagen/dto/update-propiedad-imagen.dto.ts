import { PartialType } from '@nestjs/mapped-types';
import { CreatePropiedadImagenDto } from './create-propiedad-imagen.dto';

export class UpdatePropiedadImagenDto extends PartialType(
  CreatePropiedadImagenDto,
) {}