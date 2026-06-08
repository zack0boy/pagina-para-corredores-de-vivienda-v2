import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ComprobanteEstado } from '../entities/comprobante.entity';

export class ValidarComprobanteDto {
  @IsEnum(ComprobanteEstado)
  estado!: ComprobanteEstado;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
