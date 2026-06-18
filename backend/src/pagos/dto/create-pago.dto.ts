import { IsUUID, IsNumber, IsPositive, IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { TipoPago } from '../../common/enum/estado.enum';

export class CreatePagoDto {
  @IsUUID()
  cuota_id!: string;

  @IsUUID()
  cliente_id!: string;

  @IsNumber()
  @IsPositive()
  monto!: number;

  @IsDateString()
  fecha_pago!: string;

  @IsEnum(TipoPago)
  @IsOptional()
  tipo_pago?: TipoPago;

  @IsString()
  @IsOptional()
  comentario?: string;
}
