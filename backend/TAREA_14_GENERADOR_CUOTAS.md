# Tarea 14: Generador de Cuotas Automático

## 📋 Descripción
Generador automático de cuotas para contratos de arriendo. Si un contrato es de tipo `ARRIENDO`, se generan automáticamente N cuotas según la duración del contrato.

## ✅ Funcionalidades Implementadas

### 1. Entity Contrato
- **Archivo:** `src/contratos/entities/contrato.entity.ts`
- **Campos:**
  - `id` (UUID, PK)
  - `empresa_id` (FK)
  - `propiedad_id` (FK)
  - `cliente_id` (FK)
  - `corredor_id` (FK)
  - `numero_contrato` (VARCHAR, UNIQUE)
  - `tipo` (ENUM: VENTA, ARRIENDO, RESERVA)
  - `monto_total` (DECIMAL)
  - `fecha_inicio` (DATE)
  - `fecha_fin` (DATE, nullable)
  - `contrato_url` (TEXT, nullable)
  - `estado` (ENUM: BORRADOR, ACTIVO, FINALIZADO, CANCELADO)
  - `observaciones` (TEXT)
  - Timestamps: `created_at`, `updated_at`

### 2. Entity Cuota
- **Archivo:** `src/cuotas/entities/cuota.entity.ts`
- **Campos:**
  - `id` (UUID, PK)
  - `contrato_id` (FK)
  - `numero_cuota` (INT)
  - `monto_total` (DECIMAL)
  - `monto_pagado` (DECIMAL, default: 0)
  - `saldo_pendiente` (DECIMAL)
  - `fecha_vencimiento` (DATE)
  - `fecha_pago` (DATE, nullable)
  - `estado` (ENUM: PENDIENTE, PARCIAL, PAGADA, VENCIDA, ANULADA)
  - `observaciones` (TEXT, nullable)
  - Timestamps: `created_at`, `updated_at`

### 3. Lógica de Generación de Cuotas

#### Algoritmo
```typescript
// 1. Se obtiene el contrato
// 2. Se verifica que sea tipo ARRIENDO
// 3. Se calcula número de meses entre fecha_inicio y fecha_fin
// 4. Se divide monto_total entre número de meses
// 5. Se crea una cuota para cada mes
// 6. La fecha de vencimiento de cada cuota es el mismo día del mes siguiente
```

**Ejemplo:**
- Tipo: ARRIENDO
- Monto Total: $12,000
- Fecha Inicio: 2026-06-01
- Fecha Fin: 2026-12-01
- **Resultado:** 6 cuotas de $2,000 cada una con vencimientos mensuales

### 4. Service de Cuotas - Métodos Principales

#### `generarCuotasPorArriendo(contrato_id)`
Genera automáticamente las cuotas para un contrato de arriendo
```typescript
await cuotasService.generarCuotasPorArriendo(contratoId);
// Retorna: Array<Cuota> - Lista de cuotas generadas
```

#### `registrarPago(id, monto, fecha_pago)`
Registra un pago parcial o total en una cuota
```typescript
await cuotasService.registrarPago(cuotaId, 500, new Date());
// Actualiza monto_pagado y saldo_pendiente automáticamente
// Cambia estado a PARCIAL o PAGADA según corresponda
```

#### `marcarVencida(id)`
Marca una cuota como vencida
```typescript
await cuotasService.marcarVencida(cuotaId);
```

#### `obtenerReporteCuotas(contrato_id)`
Obtiene un reporte completo de las cuotas de un contrato
```typescript
const reporte = await cuotasService.obtenerReporteCuotas(contratoId);
// Retorna: {
//   totalCuotas: 6,
//   cuotasPagadas: 3,
//   cuotasVencidas: 1,
//   cuotasPendientes: 2,
//   montoTotal: 12000,
//   montoPagado: 6000,
//   saldoPendiente: 6000,
//   porcentajePago: 50,
//   cuotas: [...]
// }
```

### 5. Service de Contratos - Métodos Principales

#### `activar(id)`
Activa un contrato de BORRADOR a ACTIVO
- Si es ARRIENDO: **genera automáticamente las cuotas**
- Si es VENTA o RESERVA: no genera cuotas

```typescript
await contratosService.activar(contratoId);
// Si tipo === 'ARRIENDO' -> llama a generarCuotasPorArriendo()
```

#### `crear(createContratoDto)`
Crea un nuevo contrato en estado BORRADOR

```typescript
const contrato = await contratosService.create({
  empresa_id: uuid,
  propiedad_id: uuid,
  cliente_id: uuid,
  corredor_id: uuid,
  numero_contrato: "CTR-2026-001",
  tipo: "ARRIENDO",
  monto_total: 12000,
  fecha_inicio: "2026-06-01",
  fecha_fin: "2026-12-01"
});
```

## 🚀 Endpoints Disponibles

### Contratos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/contratos` | Crear nuevo contrato |
| GET | `/contratos` | Listar todos (filtros: ?empresa_id, ?cliente_id, ?corredor_id) |
| GET | `/contratos/:id` | Obtener por ID |
| PATCH | `/contratos/:id` | Actualizar contrato |
| PATCH | `/contratos/:id/activar` | **Activar + generar cuotas si ARRIENDO** |
| PATCH | `/contratos/:id/finalizar` | Finalizar contrato |
| PATCH | `/contratos/:id/cancelar` | Cancelar contrato |
| DELETE | `/contratos/:id` | Eliminar contrato |

### Cuotas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/cuotas` | Crear cuota manualmente |
| GET | `/cuotas` | Listar todas las cuotas |
| GET | `/cuotas/:id` | Obtener cuota por ID |
| GET | `/cuotas/contrato/:contrato_id` | Listar cuotas de un contrato |
| GET | `/cuotas/reporte/:contrato_id` | Obtener reporte de cuotas |
| PATCH | `/cuotas/:id` | Actualizar cuota |
| PATCH | `/cuotas/:id/pago` | Registrar pago en cuota |
| PATCH | `/cuotas/:id/vencida` | Marcar como vencida |
| PATCH | `/cuotas/:id/anular` | Anular cuota |
| DELETE | `/cuotas/:id` | Eliminar cuota |

## 📝 Ejemplos de Uso

### Crear Contrato de Arriendo
```bash
POST /contratos
Content-Type: application/json

{
  "empresa_id": "550e8400-e29b-41d4-a716-446655440000",
  "propiedad_id": "550e8400-e29b-41d4-a716-446655440001",
  "cliente_id": "550e8400-e29b-41d4-a716-446655440002",
  "corredor_id": "550e8400-e29b-41d4-a716-446655440003",
  "numero_contrato": "ARR-2026-0001",
  "tipo": "ARRIENDO",
  "monto_total": 12000,
  "fecha_inicio": "2026-06-01",
  "fecha_fin": "2026-12-01",
  "observaciones": "Apartamento 4D, 6 meses de arriendo"
}
```

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "numero_contrato": "ARR-2026-0001",
  "tipo": "ARRIENDO",
  "estado": "BORRADOR",
  "monto_total": 12000,
  "fecha_inicio": "2026-06-01",
  "fecha_fin": "2026-12-01",
  "created_at": "2026-06-07T15:30:00Z"
}
```

### Activar Contrato (Genera Cuotas)
```bash
PATCH /contratos/550e8400-e29b-41d4-a716-446655440004/activar
```

**Automáticamente:**
1. Contrato pasa a estado `ACTIVO`
2. Se calculan 6 meses (junio a diciembre)
3. Se crea 1 cuota por mes de $2,000

**Cuotas generadas:**
```json
{
  "cuota": 1,
  "monto": 2000,
  "fecha_vencimiento": "2026-07-01",
  "estado": "PENDIENTE"
}
// ... 5 cuotas más
```

### Registrar Pago Parcial
```bash
PATCH /cuotas/550e8400-e29b-41d4-a716-446655440005/pago
Content-Type: application/json

{
  "monto": 1000,
  "fecha_pago": "2026-06-15"
}
```

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "numero_cuota": 1,
  "monto_total": 2000,
  "monto_pagado": 1000,
  "saldo_pendiente": 1000,
  "estado": "PARCIAL"
}
```

### Obtener Reporte de Cuotas
```bash
GET /cuotas/reporte/550e8400-e29b-41d4-a716-446655440004
```

**Respuesta:**
```json
{
  "totalCuotas": 6,
  "cuotasPagadas": 2,
  "cuotasVencidas": 1,
  "cuotasPendientes": 3,
  "montoTotal": 12000,
  "montoPagado": 4000,
  "saldoPendiente": 8000,
  "porcentajePago": 33.33,
  "cuotas": [...]
}
```

## 🔄 Flujo Completo

```
1. CREAR CONTRATO
   └─ Estado: BORRADOR
   └─ Sin cuotas generadas

2. ACTIVAR CONTRATO
   ├─ Si tipo = ARRIENDO:
   │  ├─ Calcular meses (fecha_fin - fecha_inicio)
   │  ├─ Dividir monto_total / meses
   │  └─ Generar N cuotas con vencimientos mensuales
   ├─ Si tipo = VENTA o RESERVA:
   │  └─ No generar cuotas
   └─ Estado: ACTIVO

3. REGISTRAR PAGOS
   ├─ Actualizar monto_pagado
   ├─ Actualizar saldo_pendiente
   └─ Cambiar estado: PARCIAL o PAGADA

4. OBTENER REPORTE
   ├─ Sumar totales
   ├─ Contar estados
   └─ Calcular porcentaje de pago

5. FINALIZAR CONTRATO
   └─ Estado: FINALIZADO
```

## 🎯 Fase 7 - Cuotas

✅ **Generador de Cuotas**
- Detecta si tipo = ARRIENDO
- Calcula duración en meses
- Genera N cuotas automáticamente
- Cada cuota con su fecha de vencimiento y monto

✅ **Gestión de Cuotas**
- Registro de pagos (parciales y totales)
- Cambio automático de estado
- Reporte detallado de pagos
- Anulación de cuotas

✅ **Gestión de Contratos**
- Creación con validación única
- Estados: BORRADOR → ACTIVO → FINALIZADO
- Filtros por empresa, cliente, corredor
- Cascada de eliminación (elimina cuotas)

## 📊 Base de Datos

Tablas ya existen en la BD:
- `contratos` - Almacena contratos con sus montos y fechas
- `cuotas` - Almacena las cuotas generadas, pagos y estados

## 🔐 Validaciones

1. **Número de Contrato:** Debe ser único
2. **Duración:** fecha_fin > fecha_inicio
3. **Arriendo:** Solo arriendo genera cuotas automáticamente
4. **Pago:** No se puede sobrepasar el monto total
5. **Estado:** Validaciones para transiciones de estado

## 📈 Próximas Mejoras

- Integración con sistema de pagos
- Notificaciones automáticas de vencimiento
- Generación de recibos de pago
- Reporte de cobranza por corredor
