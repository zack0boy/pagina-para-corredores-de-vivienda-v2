import { TipoNotificacion } from '../entities/notificacion.entity';

export class CreateNotificacionDto {
  empresa_id: string;
  usuario_id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
}
