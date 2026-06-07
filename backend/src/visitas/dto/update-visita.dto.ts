import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';

import { CreateVisitaDto } from './create-visita.dto';
import { EstadoVisita } from '../entities/estado-visita.enum';

export class UpdateVisitaDto extends PartialType(
  CreateVisitaDto,
) {
  @IsOptional()
  @IsEnum(EstadoVisita)
  estado?: EstadoVisita;
}