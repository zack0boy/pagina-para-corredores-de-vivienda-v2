export enum EstadoGeneral {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  PENDIENTE = 'pendiente',
}

export enum EstadoPropiedad {
  DISPONIBLE = 'disponible',
  RESERVADO = 'reservado',
  VENDIDO = 'vendido',
  ARRENDADO = 'arrendado',
}

export enum TipoOperacion {
  VENTA = 'venta',
  ARRIENDO = 'arriendo',
}

export enum MetodoPago {
  TRANSFERENCIA = 'transferencia',
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  WEBPAY = 'webpay',
}

export enum EstadoPago {
  PENDIENTE_VALIDACION = 'PENDIENTE_VALIDACION',
  VALIDADO = 'VALIDADO',
  RECHAZADO = 'RECHAZADO',
}

export enum TipoPago {
  TRANSFERENCIA = 'TRANSFERENCIA',
  PRESENCIAL = 'PRESENCIAL',
}

export enum EstadoCliente {
  PENDIENTE_VALIDACION = 'PENDIENTE_VALIDACION',
  ACTIVO = 'ACTIVO',
  RECHAZADO = 'RECHAZADO',
  SUSPENDIDO = 'SUSPENDIDO',
}

export enum EstadoSolicitudCliente {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  EXPIRADA = 'EXPIRADA',
}

export enum TipoEvento {
  VISITA = 'VISITA',
  CONTACTO_CLIENTE = 'CONTACTO_CLIENTE',
  GESTION_PAGO = 'GESTION_PAGO',
  VENCIMIENTO_CUOTA = 'VENCIMIENTO_CUOTA',
  OTRO = 'OTRO',
}

