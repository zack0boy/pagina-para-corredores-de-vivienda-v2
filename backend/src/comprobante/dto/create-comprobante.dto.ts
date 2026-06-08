import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ComprobanteEstado } from '../entities/comprobante.entity';

export class CreateComprobanteDto {
  @IsString()
  @IsNotEmpty()
  pagoId!: string;

  @IsString()
  @IsNotEmpty()
  archivoUrl!: string;

  @IsOptional()
  @IsString()
  nombreArchivo?: string;

  @IsOptional()
  @IsString()
  tipoArchivo?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsEnum(ComprobanteEstado)
  estado?: ComprobanteEstado;
}