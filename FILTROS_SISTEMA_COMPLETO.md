# 🔍 FILTROS IMPLEMENTADOS - SISTEMA COMPLETO

## ✅ FILTROS IMPLEMENTADOS (5 módulos prioritarios)

---

## 1️⃣ PROPIEDADES

**GET** `http://localhost:3000/propiedades`

### Query Parameters:
```
categoriaId          string    UUID de categoría
corredorId           string    UUID del corredor
tipoOperacion        string    VENTA | ALQUILER
estado               string    DISPONIBLE | VENDIDA | ALQUILADA
precioMin            number    Precio mínimo
precioMax            number    Precio máximo
habitaciones         number    Número de dormitorios
banos                number    Número de baños
estacionamientos     number    Número de estacionamientos
nombre               string    Búsqueda en título
empresaId            string    UUID de empresa
page                 number    Página (default: 1)
limit                number    Registros por página (default: 10)
```

### Ejemplos:
```bash
# Propiedades en venta entre 50M y 100M
GET /propiedades?tipoOperacion=VENTA&precioMin=50000000&precioMax=100000000

# Apartamentos disponibles con 2+ dormitorios
GET /propiedades?tipo=APARTAMENTO&estado=DISPONIBLE&habitaciones=2

# Propiedades de un corredor específico
GET /propiedades?corredorId=550e8400-e29b-41d4-a716-446655440000

# Con paginación
GET /propiedades?page=2&limit=20
```

### Respuesta:
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Apartamento 2D Centro",
      "precio": 250000000,
      "direccion": "Calle 50 #10-25",
      "tipo_operacion": "VENTA",
      "estado": "DISPONIBLE",
      "dormitorios": 2,
      "banos": 1
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

---

## 2️⃣ CLIENTES

**GET** `http://localhost:3000/users/clientes`

### Query Parameters:
```
nombre               string    Búsqueda en nombre
apellido             string    Búsqueda en apellido
email                string    Email exacto o parcial
telefono             string    Búsqueda en teléfono
documento            string    RUT o documento
ciudad               string    Ciudad
activo               boolean   true | false
page                 number    Página (default: 1)
limit                number    Registros por página (default: 10)
```

### Ejemplos:
```bash
# Clientes activos
GET /users/clientes?activo=true

# Buscar por nombre
GET /users/clientes?nombre=Juan

# Clientes en Bogotá
GET /users/clientes?ciudad=Bogotá

# Búsqueda compleja
GET /users/clientes?nombre=María&ciudad=Cali&activo=true&page=1&limit=20
```

### Respuesta:
```json
{
  "data": [
    {
      "idUsuario": 1,
      "usuario": {
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@gmail.com",
        "estado": "ACTIVO"
      },
      "telefono": "3001234567",
      "rut": "12345678",
      "ciudad": "Bogotá"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 10,
  "pages": 2
}
```

---

## 3️⃣ USUARIOS (Corredores/Empleados)

**GET** `http://localhost:3000/usuarios` *(próximamente)*

### Query Parameters:
```
nombre               string    Búsqueda en nombre
apellido             string    Búsqueda en apellido
email                string    Email exacto o parcial
rol                  string    CORREDOR | ADMIN_EMPRESA | SUPER_ADMIN
telefono             string    Búsqueda en teléfono
activo               boolean   true | false
empresaId            string    UUID de empresa
page                 number    Página (default: 1)
limit                number    Registros por página (default: 10)
```

### Ejemplos:
```bash
# Todos los corredores activos
GET /usuarios?rol=CORREDOR&activo=true

# Buscar empleados por nombre
GET /usuarios?nombre=Carlos&activo=true

# Corredores de una empresa específica
GET /usuarios?empresaId=550e8400-e29b-41d4-a716-446655440000&rol=CORREDOR
```

---

## 4️⃣ LEADS

**GET** `http://localhost:3000/leads`

### Query Parameters:
```
estado               string    NUEVO | CONTACTADO | ASIGNADO | CALIFICADO | PERDIDO
corredorId           string    UUID del corredor asignado
propiedadId          string    UUID de la propiedad
nombre               string    Nombre del cliente
email                string    Email del cliente
telefono             string    Teléfono del cliente
empresaId            string    UUID de empresa
fechaDesde           string    Fecha inicio YYYY-MM-DD (created_at)
fechaHasta           string    Fecha fin YYYY-MM-DD (created_at)
page                 number    Página (default: 1)
limit                number    Registros por página (default: 10)
```

### Ejemplos:
```bash
# Leads nuevos sin asignar
GET /leads?estado=NUEVO

# Leads de un corredor específico
GET /leads?corredorId=550e8400-e29b-41d4-a716-446655440000&estado=ASIGNADO

# Leads creados en el último mes
GET /leads?fechaDesde=2026-05-08&fechaHasta=2026-06-08

# Búsqueda compleja
GET /leads?estado=CONTACTADO&corredorId=550e8400&nombre=María&page=1&limit=15
```

### Respuesta:
```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "María González",
      "email": "maria@gmail.com",
      "telefono": "3015554321",
      "estado": "ASIGNADO",
      "corredor_id": "uuid",
      "propiedad_id": "uuid",
      "created_at": "2026-06-08T10:30:00Z"
    }
  ],
  "total": 28,
  "page": 1,
  "limit": 10,
  "pages": 3
}
```

---

## 5️⃣ VISITAS

**GET** `http://localhost:3000/visitas`

### Query Parameters:
```
estado               string    PROGRAMADA | CONFIRMADA | REALIZADA | CANCELADA
clienteId            string    UUID del cliente
corredorId           string    UUID del corredor
propiedadId          string    UUID de la propiedad
empresaId            string    UUID de empresa
fechaDesde           string    Desde fecha YYYY-MM-DD HH:mm:ss
fechaHasta           string    Hasta fecha YYYY-MM-DD HH:mm:ss
page                 number    Página (default: 1)
limit                number    Registros por página (default: 10)
```

### Ejemplos:
```bash
# Visitas programadas para hoy
GET /visitas?estado=PROGRAMADA&fechaDesde=2026-06-08&fechaHasta=2026-06-08

# Visitas de un corredor
GET /visitas?corredorId=550e8400-e29b-41d4-a716-446655440000

# Visitas realizadas en una propiedad
GET /visitas?propiedadId=550e8400-e29b-41d4-a716-446655440000&estado=REALIZADA

# Búsqueda compleja con fecha rango
GET /visitas?estado=CONFIRMADA&fechaDesde=2026-06-01&fechaHasta=2026-06-30&page=1&limit=20
```

### Respuesta:
```json
{
  "data": [
    {
      "id": "uuid",
      "cliente_id": "uuid",
      "corredor_id": "uuid",
      "propiedad_id": "uuid",
      "estado": "CONFIRMADA",
      "fecha_inicio": "2026-06-15T14:30:00Z",
      "fecha_fin": "2026-06-15T15:30:00Z"
    }
  ],
  "total": 54,
  "page": 1,
  "limit": 10,
  "pages": 6
}
```

---

## 📊 PATRÓN COMÚN DE RESPUESTA

Todos los endpoints con filtros devuelven:

```json
{
  "data": [...],          // Array de resultados
  "total": 100,           // Total de registros
  "page": 1,              // Página actual
  "limit": 10,            // Registros por página
  "pages": 10             // Total de páginas
}
```

---

## 🔗 POSTMAN - COLECCIÓN ACTUALIZADA

```json
{
  "info": {
    "name": "Sistema Filtros",
    "description": "Todos los endpoints con filtros"
  },
  "item": [
    {
      "name": "Propiedades",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/propiedades?tipoOperacion=VENTA&precioMin=50000000&precioMax=100000000&page=1&limit=10",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["propiedades"],
          "query": [
            {"key": "tipoOperacion", "value": "VENTA"},
            {"key": "precioMin", "value": "50000000"},
            {"key": "precioMax", "value": "100000000"},
            {"key": "page", "value": "1"},
            {"key": "limit", "value": "10"}
          ]
        }
      }
    }
  ]
}
```

---

## ⚙️ IMPLEMENTACIÓN TÉCNICA

### DTOs de Filtro Creados:

✅ `backend/src/propiedades/dto/filter-propiedades.dto.ts`
✅ `backend/src/users/dto/filter-cliente.dto.ts`
✅ `backend/src/users/dto/filter-usuario.dto.ts`
✅ `backend/src/lead/dto/filter-lead.dto.ts`
✅ `backend/src/visitas/dto/filter-visita.dto.ts`

### Métodos Implementados en Services:

- `PropiedadesService.findWithFilters(filters: FilterPropiedadesDto)`
- `UsersService.findClientesWithFilters(filters: FilterClienteDto)`
- `UsersService.findUsuariosWithFilters(filters: FilterUsuarioDto)`
- `LeadsService.findWithFilters(filters: FilterLeadDto)`
- `VisitasService.findWithFilters(filters: FilterVisitaDto)`

### Controladores Actualizados:

- `PropiedadesController.findAll(filters)` ✅
- `UsersController.getAllClientes(filters)` ✅
- `LeadsController.findAll(filters)` ✅
- `VisitasController.findAll(filters)` ✅

---

## 🧪 TESTEAR EN POSTMAN

### Test 1: Propiedades por rango de precio
```
GET http://localhost:3000/propiedades?precioMin=100000000&precioMax=300000000
```
**Esperado:** Array de propiedades en ese rango

### Test 2: Clientes activos
```
GET http://localhost:3000/users/clientes?activo=true
```
**Esperado:** Solo clientes con estado ACTIVO

### Test 3: Leads nuevos del último mes
```
GET http://localhost:3000/leads?estado=NUEVO&fechaDesde=2026-05-08&fechaHasta=2026-06-08
```
**Esperado:** Leads creados en el período especificado

### Test 4: Visitas programadas con paginación
```
GET http://localhost:3000/visitas?estado=PROGRAMADA&page=2&limit=15
```
**Esperado:** Segunda página con 15 registros

### Test 5: Búsqueda avanzada
```
GET http://localhost:3000/propiedades?tipoOperacion=VENTA&estado=DISPONIBLE&habitaciones=2&banos=1&page=1&limit=5
```
**Esperado:** Casas en venta, disponibles, 2D 1B, página 1

---

## 📋 CHECKLIST

- [x] DTO de filtros creados para 5 módulos
- [x] Métodos findWithFilters implementados
- [x] QueryBuilder con condiciones dinámicas
- [x] Paginación incluida en todas las respuestas
- [x] Controladores actualizados
- [x] Compatibilidad con query params antiguos (visitas)
- [ ] Próximo: Implementar filtros para Contratos, Cuotas, Pagos (si hay tiempo)

---

## 🚀 PRÓXIMOS PASOS (Otros módulos)

Si necesitas más filtros después, aplica el mismo patrón en:

- Contratos
- Cuotas  
- Pagos
- Comprobantes

La estructura es la misma:
1. Crear `filter-[modulo].dto.ts`
2. Agregar método `findWithFilters()` en service
3. Importar DTO en controller
4. Actualizar método GET en controller
