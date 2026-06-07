import {
  IsString,
  IsUUID,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateCorredorDto {
  @IsUUID()
  empresa_id!: string;

  @IsString()
  nombre!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}
