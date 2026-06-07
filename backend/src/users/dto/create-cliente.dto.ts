import { IsString, IsEmail, IsPhoneNumber, Length, IsOptional, IsNotEmpty, Matches } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 255)
  password!: string;

  @IsString()
  @Length(5, 20)
  telefono!: string;

  @IsString()
  @Matches(/^\d{1,2}\.\d{3}\.\d{3}[-]?[0-9Kk]$/, {
    message: 'RUT debe estar en formato válido (ej: 12.345.678-9)',
  })
  rut!: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  telefono?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}

export class ClienteResponseDto {
  idUsuario!: number;
  nombre!: string;
  email!: string;
  telefono?: string;
  rut!: string;
  direccion?: string;
  createdAt!: Date;
}
