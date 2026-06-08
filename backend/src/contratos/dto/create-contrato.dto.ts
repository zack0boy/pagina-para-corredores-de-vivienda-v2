import { IsUUID, IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { TipoContrato } from '../entities/contrato.entity';

export class CreateContratoDto {
  @IsUUID()
  empresa_id!: string;

  @IsUUID()
  propiedad_id!: string;

  @IsUUID()
  cliente_id!: string;

  @IsUUID()
  corredor_id!: string;

  @IsString()
  numero_contrato!: string;

  @IsEnum(TipoContrato)
  tipo!: TipoContrato;

  @IsNumber()
  monto_total!: number;

  @IsDateString()
  fecha_inicio!: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  contrato_url?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
