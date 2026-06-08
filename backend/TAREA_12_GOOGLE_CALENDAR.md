# Tarea 12: Integración Google Calendar

## 📋 Descripción
Integración de Google Calendar API para sincronizar visitas a propiedades con el calendario del corredor.

## ✅ Funcionalidades Implementadas

### 1. Crear Evento
- **Archivo:** `src/google-calendar/google-calendar.service.ts`
- **Método:** `createEvent(data)`
- **Parámetros:**
  - `titulo`: Nombre del evento (ej: "Visita propiedad - abc123")
  - `descripcion`: Observaciones de la visita
  - `fechaInicio`: Hora de inicio de la visita
  - `fechaFin`: Hora de fin de la visita
  - `email_corredor`: Email del corredor (opcional, para agregar como asistente)
- **Retorna:** ID del evento de Google Calendar

### 2. Actualizar Evento
- **Método:** `updateEvent(googleEventId, data)`
- **Parámetros:** Todos opcionales (titulo, descripcion, fechaInicio, fechaFin)
- **Uso:** Sincroniza cambios de horario en visitas

### 3. Cancelar Evento
- **Método:** `deleteEvent(googleEventId)`
- **Uso:** Elimina evento cuando se cancela una visita

### 4. Obtener Evento
- **Método:** `getEvent(googleEventId)`
- **Uso:** Verificar estado del evento en Google Calendar

## 🔧 Configuración Requerida

### Variables de Entorno (.env)
```
GOOGLE_CLIENT_EMAIL=xxxxx@xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_CALENDAR_ID=xxxxx@group.calendar.google.com
```

### Pasos de Configuración de Google Cloud
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Calendar API
3. Crear cuenta de servicio (Service Account)
4. Descargar JSON de credenciales
5. Agregar cuenta de servicio al calendario deseado como editor
6. Copiar `client_email` y `private_key` a .env

## 📊 Estructura de la Base de Datos

### Tabla `visitas`
```sql
CREATE TABLE visitas (
  id UUID PRIMARY KEY,
  empresa_id UUID NOT NULL,
  lead_id UUID,
  propiedad_id UUID NOT NULL,
  cliente_id UUID NOT NULL,
  corredor_id UUID NOT NULL,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  estado ENUM('PROGRAMADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'NO_ASISTIO'),
  google_event_id VARCHAR(255),  -- <-- ID del evento de Google
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

El campo `google_event_id` almacena el identificador del evento en Google Calendar.

## 🚀 Endpoints Disponibles

### CRUD Base
- `POST /visitas` - Crear visita + sincronizar
- `GET /visitas` - Listar visitas
- `GET /visitas/:id` - Obtener visita
- `PATCH /visitas/:id` - Actualizar visita
- `DELETE /visitas/:id` - Eliminar visita + limpiar calendario

### Gestión de Estados
- `PATCH /visitas/:id/cancelar` - Cancelar visita
- `PATCH /visitas/:id/confirmar` - Confirmar visita
- `PATCH /visitas/:id/realizada` - Marcar como realizada
- `PATCH /visitas/:id/no-asistio` - Registrar no asistencia

### Sincronización Manual
- `PATCH /visitas/:id/sincronizar` - Forzar sincronización con Google Calendar

### Filtros
```
GET /visitas?corredor_id=uuid     -- Visitas de un corredor
GET /visitas?empresa_id=uuid      -- Visitas de una empresa
```

## 📝 Ejemplos de Uso

### Crear Visita
```bash
POST /visitas
Content-Type: application/json

{
  "empresa_id": "550e8400-e29b-41d4-a716-446655440000",
  "propiedad_id": "550e8400-e29b-41d4-a716-446655440001",
  "cliente_id": "550e8400-e29b-41d4-a716-446655440002",
  "corredor_id": "550e8400-e29b-41d4-a716-446655440003",
  "fecha_inicio": "2026-06-15T10:00:00Z",
  "fecha_fin": "2026-06-15T11:00:00Z",
  "observaciones": "Visita a apartamento 4D"
}
```

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "empresa_id": "550e8400-e29b-41d4-a716-446655440000",
  "propiedad_id": "550e8400-e29b-41d4-a716-446655440001",
  "cliente_id": "550e8400-e29b-41d4-a716-446655440002",
  "corredor_id": "550e8400-e29b-41d4-a716-446655440003",
  "fecha_inicio": "2026-06-15T10:00:00Z",
  "fecha_fin": "2026-06-15T11:00:00Z",
  "estado": "PROGRAMADA",
  "google_event_id": "abc123def456ghi789",  -- ← Creado automáticamente
  "observaciones": "Visita a apartamento 4D",
  "created_at": "2026-06-07T15:30:00Z",
  "updated_at": "2026-06-07T15:30:00Z"
}
```

### Actualizar Hora de Visita
```bash
PATCH /visitas/550e8400-e29b-41d4-a716-446655440004
Content-Type: application/json

{
  "fecha_inicio": "2026-06-15T14:00:00Z",
  "fecha_fin": "2026-06-15T15:00:00Z"
}
```

**Automáticamente:**
- Actualiza fecha en BD
- Sincroniza cambio en Google Calendar

### Cancelar Visita
```bash
PATCH /visitas/550e8400-e29b-41d4-a716-446655440004/cancelar
```

**Automáticamente:**
- Cambia estado a CANCELADA
- Elimina evento de Google Calendar

### Sincronización Manual
```bash
PATCH /visitas/550e8400-e29b-41d4-a716-446655440004/sincronizar
```

Útil si:
- Falló la sincronización inicial
- Se cambió configuración de Google Calendar
- Se necesita forzar una resincronización

## ⚙️ Arquitectura

### Flujo de Creación de Visita
```
1. Cliente envía POST /visitas
2. VisitasController recibe solicitud
3. VisitasService.create() es llamado
4. GoogleCalendarService.createEvent() intenta crear evento
5. Si Google Calendar falla:
   - Visita se crea IGUAL en BD (sin google_event_id)
   - Se registra warning en logs
6. Si Google Calendar tiene éxito:
   - Visita se crea con google_event_id
7. Respuesta incluye google_event_id si está disponible
```

### Estados de Visita
- **PROGRAMADA** → Inicial, no confirmada
- **CONFIRMADA** → Cliente confirmó asistencia
- **REALIZADA** → Visita se llevó a cabo
- **CANCELADA** → Visita fue cancelada (evento eliminado de Google)
- **NO_ASISTIO** → Cliente no asistió

## 🔒 Seguridad

- Credenciales de Google no se exponen
- Variables de entorno protegidas
- Validación de credenciales antes de cada operación
- Manejo robusto de excepciones
- Logging de errores para auditoría

## 🐛 Manejo de Errores

Si Google Calendar no está disponible:
- La visita se crea IGUAL en la BD
- Se puede sincronizar manualmente después
- Usuario puede regresar a intentarlo

Excepciones:
- Credenciales no configuradas → `BadRequestException`
- Google Calendar offline → Se crea en BD, falla silenciosamente
- Evento no encontrado → `BadRequestException`

## 📈 Fase 5 - Entregables

✅ **Crear Visita**
- Endpoint POST /visitas funcional
- Validación de datos completa
- Sincronización automática

✅ **Sincronizar Calendario**
- Automático al crear/actualizar
- Manual vía PATCH /:id/sincronizar
- Campo google_event_id guardado en BD

## 🔗 Dependencias

- `@nestjs/core` - Framework NestJS
- `googleapis` - Google APIs
- `typeorm` - ORM para base de datos
- `class-validator` - Validación de DTOs

## 📞 Soporte

Para debug:
1. Verificar .env tiene credenciales correctas
2. Revisar logs de la aplicación
3. Confirmar que cuenta de servicio tiene acceso al calendario
4. Probar sincronización manual: `PATCH /visitas/:id/sincronizar`
