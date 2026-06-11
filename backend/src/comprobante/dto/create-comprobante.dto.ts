import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}