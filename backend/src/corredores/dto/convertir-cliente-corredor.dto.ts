import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ConvertirClienteACorredorDto {
  @IsUUID(undefined, { message: 'usuario_id debe ser un UUID válido' })
  usuario_id!: string;

  @IsUUID(undefined, { message: 'empresa_id debe ser un UUID válido' })
  empresa_id!: string;

  @IsOptional()
  @IsString({ message: 'licenciaProfesional debe ser un string' })
  licenciaProfesional?: string;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser un string' })
  descripcion?: string;
}