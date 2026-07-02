import { IsUUID, IsOptional, IsString, Matches } from 'class-validator';

export class ConvertirClienteACorredorDto {
  @IsUUID(undefined, { message: 'usuario_id debe ser un UUID válido' })
  usuario_id!: string;

  // Opcional: si no viene, se usa la empresa del administrador que convierte
  @IsOptional()
  @IsString({ message: 'empresa_id debe ser un string' })
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'empresa_id debe ser un UUID válido',
  })
  empresa_id?: string;

  @IsOptional()
  @IsString({ message: 'licenciaProfesional debe ser un string' })
  licenciaProfesional?: string;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser un string' })
  descripcion?: string;
}
