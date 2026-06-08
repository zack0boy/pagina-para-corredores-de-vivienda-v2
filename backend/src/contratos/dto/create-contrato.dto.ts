import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoOperacion } from '../../common/enum/estado.enum';

export class CreateContratoDto {
  @IsNumber()
  @Type(() => Number)
  idCliente!: number;

  @IsNumber()
  @Type(() => Number)
  idCorredor!: number;

  @IsUUID()
  idPropiedad!: string;

  @IsEnum(TipoOperacion)
  tipo!: TipoOperacion;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  montoTotal!: number;

  @IsDateString()
  fechaInicio!: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

