import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional } from 'class-validator';
import { CreatePropiedadesDto } from './create-propiedades.dto';

export class UpdatePropiedadesDto extends PartialType(
  CreatePropiedadesDto,
) {
  // Estado de la propiedad (DISPONIBLE, RESERVADA, VENDIDA, ARRENDADA, INACTIVA)
  @IsString()
  @IsOptional()
  estado?: string;
}
