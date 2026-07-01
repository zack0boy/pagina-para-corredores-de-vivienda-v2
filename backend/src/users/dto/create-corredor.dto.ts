import { IsString, IsEmail, Length, IsOptional } from 'class-validator';

export class CreateCorredorDto {
  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsString()
  @Length(8, 255)
  password!: string;

  @IsOptional()
  @IsString()
  @Length(5, 50)
  licenciaProfesional?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateCorredorDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombre?: string;

  @IsOptional()
  @IsEmail() 
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(5, 50)
  licenciaProfesional?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class CorredorResponseDto {
  idUsuario!: number;
  nombre!: string;
  email!: string;
  licenciaProfesional?: string;
  descripcion?: string;
  createdAt!: Date;
}
