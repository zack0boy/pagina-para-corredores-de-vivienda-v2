import { IsUUID, IsString, IsNumber, IsInt, IsDateString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { TipoContrato, FormaPagoContrato } from '../entities/contrato.entity';

export class CreateContratoDto {
  // Se rellenan en el servidor a partir del usuario autenticado (nunca se confía en el body);
  // opcionales acá para que el corredor no tenga que enviarlos.
  @IsOptional()
  @IsUUID()
  empresa_id?: string;

  @IsOptional()
  @IsUUID()
  corredor_id?: string;

  @IsUUID()
  propiedad_id!: string;

  @IsUUID()
  cliente_id!: string;

  @IsString()
  numero_contrato!: string;

  @IsEnum(TipoContrato)
  tipo!: TipoContrato;

  @IsOptional()
  @IsEnum(FormaPagoContrato)
  forma_pago?: FormaPagoContrato;

  @IsNumber()
  monto_total!: number;

  @IsDateString()
  fecha_inicio!: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  // Monto deseado por cuota mensual (solo forma_pago=CUOTAS). Si se envía, el servidor
  // calcula automáticamente cuántos meses toma y fija fecha_fin — el corredor no necesita
  // calcularla ni escribirla a mano.
  @IsOptional()
  @IsNumber()
  monto_cuota_mensual?: number;

  // Día del mes en que vence cada cuota (1-28, para evitar problemas con meses cortos).
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  dia_pago_mensual?: number;

  @IsOptional()
  @IsString()
  contrato_url?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
