import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLeadDto {
  @IsUUID()
  empresa_id!: string;

  @IsUUID()
  propiedad_id!: string;

  @IsString()
  nombre!: string;

  @IsString()
  telefono!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  mensaje?: string;

  @IsOptional()
  @IsUUID()
  cliente_id?: string;
}