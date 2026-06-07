import {
  IsUUID,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReassignLeadDto {
  @IsUUID()
  corredor_id!: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
