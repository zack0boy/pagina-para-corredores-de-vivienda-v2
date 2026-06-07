import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { LeadEstado } from '../entities/lead.entity';

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadEstado)
  estado?: LeadEstado;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsUUID()
  corredor_id?: string;

  @IsOptional()
  @IsUUID()
  propiedad_id?: string;
}