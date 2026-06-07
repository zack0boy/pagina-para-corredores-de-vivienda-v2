import {
  IsString,
  IsUUID,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateCategoriaDto {
  @IsUUID()
  empresa_id!: string;

  @IsString()
  @MinLength(3)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}