export class CreatePropiedadesDto {
  empresa_id!: string;

  categoria_id!: string;

  titulo!: string;

  descripcion?: string;

  precio!: number;

  tipo_operacion!: string;

  direccion!: string;

  latitud?: number;

  longitud?: number;
}