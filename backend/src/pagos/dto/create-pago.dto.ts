import { IsUUID, IsNumber, IsPositive, IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { TipoPago } from '../../common/enum/estado.enum';

export class CreatePagoDto {
  @IsUUID()
  @IsOptional()
  cuota_id?: string;

  @IsUUID()
  @IsOptional()
  cliente_id?: string;

  // Nombre del cliente para registro manual
  @IsString()
  @IsOptional()
  cliente_nombre?: string;

  // Corredor que registra el pago
  @IsUUID()
  @IsOptional()
  corredor_id?: string;

  // Propiedad asociada (opcional)
  @IsUUID()
  @IsOptional()
  propiedad_id?: string;

  @IsString()
  @IsOptional()
  propiedad_titulo?: string;

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
