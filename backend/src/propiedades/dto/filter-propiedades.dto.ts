import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterPropiedadesDto {
  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsString()
  corredorId?: string;

  @IsOptional()
  @IsString()
  tipoOperacion?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  habitaciones?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  banos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estacionamientos?: number;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  empresaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
