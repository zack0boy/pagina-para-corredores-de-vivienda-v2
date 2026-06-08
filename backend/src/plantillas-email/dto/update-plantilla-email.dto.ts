import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdatePlantillaEmailDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  asunto?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
