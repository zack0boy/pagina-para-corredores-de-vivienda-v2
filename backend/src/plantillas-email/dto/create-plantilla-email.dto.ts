import { IsUUID, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePlantillaEmailDto {
  @IsUUID()
  empresa_id: string;

  @IsString()
  nombre: string;

  @IsString()
  asunto: string;

  @IsString()
  contenido: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
