import { PartialType } from '@nestjs/mapped-types';
import { CreateCuotaDto } from './create-cuota.dto';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { EstadoCuota } from '../entities/cuota.entity';

export class UpdateCuotaDto extends PartialType(CreateCuotaDto) {
  @IsOptional()
  @IsEnum(EstadoCuota)
  estado?: EstadoCuota;

  @IsOptional()
  @IsNumber()
  monto_pagado?: number;

  @IsOptional()
  @IsNumber()
  saldo_pendiente?: number;
}
