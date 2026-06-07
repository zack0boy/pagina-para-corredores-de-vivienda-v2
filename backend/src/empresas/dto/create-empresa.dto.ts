import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsUrl,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @MinLength(3)
  nombre!: string;

  @IsOptional()
  @IsString()
  rut?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsString()
  plan?: string;
}