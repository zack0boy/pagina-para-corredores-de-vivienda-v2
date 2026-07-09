import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ComprobanteEstado } from '../entities/comprobante.entity';

export class ValidarComprobanteDto {
  @IsEnum(ComprobanteEstado)
  estado!: ComprobanteEstado;

  @IsUUID()
  validado_por!: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
