import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsEnum,
  MinLength,
} from 'class-validator';

export enum TipoOperacion {
  VENTA = 'VENTA',
  ARRIENDO = 'ARRIENDO',
}

export class CreatePropiedadesDto {
  // String (no @IsUUID) porque la empresa semilla usa un id no estándar (0000...0001)
  @IsString()
  empresa_id!: string;

  @IsString()
  categoria_id!: string;

  @IsString()
  @MinLength(5)
  codigo!: string;

  @IsString()
  @MinLength(10)
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  direccion!: string;

  @IsNumber()
  precio!: number;

  @IsEnum(TipoOperacion)
  tipo_operacion!: TipoOperacion;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;

  @IsOptional()
  @IsNumber()
  habitaciones?: number;

  @IsOptional()
  @IsNumber()
  banos?: number;

  @IsOptional()
  @IsNumber()
  estacionamientos?: number;

  @IsOptional()
  @IsNumber()
  metros_totales?: number;

  @IsOptional()
  @IsNumber()
  metros_construidos?: number;

  @IsOptional()
  @IsUUID()
  corredor_id?: string;
}