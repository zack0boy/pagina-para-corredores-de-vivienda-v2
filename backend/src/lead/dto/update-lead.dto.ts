import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import { LeadEstado } from '../entities/lead.entity';

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadEstado)
  estado?: LeadEstado;

  @IsOptional()
  @IsString()
  observaciones?: string;
}