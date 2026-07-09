import { RolUsuario } from '../enum/roles.enum';

// Representa al usuario autenticado (req.user) para aplicar aislamiento de datos
// por rol: SUPER_ADMIN ve todo, ADMIN_EMPRESA solo su empresa, CORREDOR solo lo suyo.
export interface ActorContext {
  id: string;
  role: RolUsuario;
  empresa_id?: string;
}

export function actorDeRequest(req: any): ActorContext {
  return {
    id: req.user.id,
    role: req.user.role,
    empresa_id: req.user.empresa_id,
  };
}
