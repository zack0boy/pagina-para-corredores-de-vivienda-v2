import { IsString, IsEmail, IsOptional, IsUUID, Length, MinLength } from 'class-validator';

export class CreateClienteDto {
  @IsUUID()
  empresa_id!: string;

  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsString()
  @Length(1, 100)
  apellido!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @Length(5, 30)
  telefono!: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  apellido?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(5, 30)
  telefono?: string;
}

export class ClienteResponseDto {
  id!: string;
  empresa_id!: string;
  nombre!: string;
  apellido!: string;
  email?: string;
  telefono!: string;
  estado!: string;
  activo!: boolean;
  createdAt!: Date;
}
