import { IsOptional, IsString } from 'class-validator';

export class ValidarComprobanteDto {
  @IsOptional()
  @IsString()
  observaciones?: string;
}
