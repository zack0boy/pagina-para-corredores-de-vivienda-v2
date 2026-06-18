import { IsUUID, IsEnum, IsString, IsDateString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { TipoEvento } from '../../common/enum/estado.enum';

export class CreateEventoCalendarioDto {
  @IsUUID()
  empresa_id!: string;

  @IsUUID()
  corredor_id!: string;

  @IsUUID()
  @IsOptional()
  cliente_id?: string;

  @IsUUID()
  @IsOptional()
  visita_id?: string;

  @IsEnum(TipoEvento)
  tipo!: TipoEvento;

  @IsString()
  @MaxLength(150)
  titulo!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  fecha_inicio!: string;

  @IsDateString()
  fecha_fin!: string;
}
