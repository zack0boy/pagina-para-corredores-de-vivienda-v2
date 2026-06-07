import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVisitaDto {
  @IsUUID()
  empresa_id!: string;

  @IsUUID()
  propiedad_id!: string;

  @IsUUID()
  cliente_id!: string;

  @IsUUID()
  corredor_id!: string;

  @IsOptional()
  @IsUUID()
  lead_id?: string;

  @IsDateString()
  fecha_inicio!: string;

  @IsDateString()
  fecha_fin!: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}