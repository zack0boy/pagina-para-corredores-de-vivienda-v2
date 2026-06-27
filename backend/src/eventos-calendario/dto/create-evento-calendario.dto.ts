import { IsEnum, IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { TipoEvento } from '../../common/enum/estado.enum';

export class CreateEventoCalendarioDto {
  // Se valida como string (no @IsUUID) porque la empresa semilla
  // usa un identificador no estándar (0000...0001).
  @IsString()
  empresa_id!: string;

  @IsString()
  corredor_id!: string;

  @IsString()
  @IsOptional()
  cliente_id?: string;

  @IsString()
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
