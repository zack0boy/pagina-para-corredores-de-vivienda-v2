import { IsString, IsEmail, Length, IsOptional, Matches } from 'class-validator';

export class CreateCorredorDto {
  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsEmail()
  email!: string;

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
  @IsString()
  @Length(5, 50)
  licenciaProfesional?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class CorredorResponseDto {
  idUsuario!: string;
  nombre!: string;
  email!: string;
  licenciaProfesional?: string;
  descripcion?: string;
  createdAt!: Date;
}
