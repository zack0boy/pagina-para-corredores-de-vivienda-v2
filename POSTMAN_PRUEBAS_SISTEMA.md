# PRUEBAS POSTMAN - SISTEMA COMPLETO

## ⚡ QUICK START

1. Abre Postman
2. Importa JSON (abajo): `Ctrl+K` → Paste raw text
3. O copia cada request manualmente
4. Backend debe estar en: `http://localhost:3000`

---

## 🔐 AUTH TESTS

### TEST 1: Register User (Crear Usuario)

**Método:** POST  
**URL:** `http://localhost:3000/auth/register`  
**Body:**
```json
{
  "email": "usuario_test@gmail.com",
  "password": "Password123!",
  "nombre": "Test User",
  "apellido": "Testing"
}
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "email": "usuario_test@gmail.com",
  "nombre": "Test User",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**❌ Error esperado si ya existe:**
```json
{
  "statusCode": 400,
  "message": "El usuario ya existe"
}
```

---

### TEST 2: Login (Iniciar Sesión)

**Método:** POST  
**URL:** `http://localhost:3000/auth/login`  
**Body:**
```json
{
  "email": "usuario_test@gmail.com",
  "password": "Password123!"
}
```

**✅ Resultado Esperado (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario_test@gmail.com",
    "nombre": "Test User"
  }
}
```

**⚠️ Guarda el token para los siguientes tests en variable:**
- Clic derecho en Response → "Set variable" → Nombre: `token`

---

## 👥 USERS TESTS

### TEST 3: Create Client (Crear Cliente)

**Método:** POST  
**URL:** `http://localhost:3000/users/clientes`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "email": "cliente@gmail.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3001234567",
  "documento": "12345678",
  "ciudad": "Bogotá"
}
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "email": "cliente@gmail.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3001234567",
  "documento": "12345678",
  "ciudad": "Bogotá"
}
```

**💾 Guarda el ID:** Clic derecho → "Set variable" → Nombre: `client_id`

---

### TEST 4: Get All Clients (Listar Clientes)

**Método:** GET  
**URL:** `http://localhost:3000/users/clientes`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):**
```json
[
  {
    "id": "uuid",
    "email": "cliente@gmail.com",
    "nombre": "Juan",
    ...
  },
  {
    "id": "uuid2",
    "email": "cliente2@gmail.com",
    ...
  }
]
```

---

### TEST 5: Get Single Client

**Método:** GET  
**URL:** `http://localhost:3000/users/clientes/{{client_id}}`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):**
```json
{
  "id": "uuid",
  "email": "cliente@gmail.com",
  "nombre": "Juan",
  "apellido": "Pérez"
}
```

---

### TEST 6: Update Client

**Método:** PATCH  
**URL:** `http://localhost:3000/users/clientes/{{client_id}}`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Juan Carlos",
  "telefono": "3009876543"
}
```

**✅ Resultado Esperado (200):**
```json
{
  "id": "uuid",
  "email": "cliente@gmail.com",
  "nombre": "Juan Carlos",
  "telefono": "3009876543"
}
```

---

## 🏢 EMPRESAS TESTS

### TEST 7: Create Empresa

**Método:** POST  
**URL:** `http://localhost:3000/empresas`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Inmobiliaria Premium",
  "nit": "900123456",
  "email": "info@inmobiliaria.com",
  "telefono": "6015551234",
  "ciudad": "Bogotá"
}
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "nombre": "Inmobiliaria Premium",
  "nit": "900123456",
  "email": "info@inmobiliaria.com"
}
```

**💾 Guarda el ID:** `empresa_id`

---

### TEST 8: Get All Empresas

**Método:** GET  
**URL:** `http://localhost:3000/empresas`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):** Array de empresas

---

### TEST 9: Update Empresa

**Método:** PATCH  
**URL:** `http://localhost:3000/empresas/{{empresa_id}}`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Inmobiliaria Premium Plus",
  "telefono": "6015551111"
}
```

**✅ Resultado Esperado (200):** Empresa actualizada

---

## 🏠 PROPIEDADES TESTS

### TEST 10: Create Propiedad

**Método:** POST  
**URL:** `http://localhost:3000/propiedades`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "titulo": "Apartamento 2 Dormitorios Centro",
  "descripcion": "Apartamento moderno en zona central",
  "precio": 250000000,
  "direccion": "Calle 50 #10-25",
  "ciudad": "Bogotá",
  "tipo": "apartamento",
  "dormitorios": 2,
  "banos": 1,
  "area": 65,
  "categoria_id": "uuid_categoria",
  "empresa_id": "{{empresa_id}}"
}
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "titulo": "Apartamento 2 Dormitorios Centro",
  "precio": 250000000,
  "direccion": "Calle 50 #10-25"
}
```

**💾 Guarda el ID:** `propiedad_id`

---

### TEST 11: Get All Propiedades

**Método:** GET  
**URL:** `http://localhost:3000/propiedades`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):** Array de propiedades

---

### TEST 12: Get Single Propiedad

**Método:** GET  
**URL:** `http://localhost:3000/propiedades/{{propiedad_id}}`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):** Propiedad con detalles completos

---

### TEST 13: Update Propiedad

**Método:** PATCH  
**URL:** `http://localhost:3000/propiedades/{{propiedad_id}}`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "precio": 270000000,
  "descripcion": "Apartamento renovado con balcón"
}
```

**✅ Resultado Esperado (200):** Propiedad actualizada

---

## 📸 PROPIEDAD-IMAGEN TESTS

### TEST 14: Upload Imagen a Propiedad

**Método:** POST  
**URL:** `http://localhost:3000/propiedad-imagen/{{propiedad_id}}`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**Body:** Form-data
```
File: [Selecciona imagen PNG/JPG]
Key: file
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "propiedad_id": "uuid",
  "url": "https://cloudinary.com/...",
  "orden": 1
}
```

**💾 Guarda el ID:** `imagen_id`

---

### TEST 15: Get Imágenes de Propiedad

**Método:** GET  
**URL:** `http://localhost:3000/propiedad-imagen?propiedad_id={{propiedad_id}}`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):** Array de imágenes con URLs

---

## 🔗 LEADS TESTS

### TEST 16: Create Lead

**Método:** POST  
**URL:** `http://localhost:3000/leads`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "María García",
  "email": "maria@gmail.com",
  "telefono": "3015551234",
  "interes": "Apartamento 2 dormitorios",
  "presupuesto_min": 150000000,
  "presupuesto_max": 350000000,
  "ciudad": "Bogotá"
}
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "nombre": "María García",
  "email": "maria@gmail.com",
  "estado": "nuevo"
}
```

**💾 Guarda el ID:** `lead_id`

---

### TEST 17: Get All Leads

**Método:** GET  
**URL:** `http://localhost:3000/leads`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):** Array de leads

---

### TEST 18: Assign Corredor to Lead

**Método:** PATCH  
**URL:** `http://localhost:3000/leads/{{lead_id}}/reassign-corredor`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "corredor_id": "uuid_corredor"
}
```

**✅ Resultado Esperado (200):** Lead con corredor asignado

---

## 📅 VISITAS TESTS

### TEST 19: Create Visita

**Método:** POST  
**URL:** `http://localhost:3000/visitas`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2026-06-15T14:30:00",
  "propiedad_id": "{{propiedad_id}}",
  "cliente_id": "{{client_id}}",
  "corredor_id": "uuid_corredor",
  "notas": "Visita confirmada con el cliente"
}
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "fecha": "2026-06-15T14:30:00",
  "estado": "programada"
}
```

**💾 Guarda el ID:** `visita_id`

---

### TEST 20: Get All Visitas

**Método:** GET  
**URL:** `http://localhost:3000/visitas`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):** Array de visitas

---

### TEST 21: Confirmar Visita

**Método:** PATCH  
**URL:** `http://localhost:3000/visitas/{{visita_id}}/confirmar`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "confirmacion": "Cliente confirmó asistencia"
}
```

**✅ Resultado Esperado (200):** Visita confirmada

---

### TEST 22: Mark Visita as Realizada

**Método:** PATCH  
**URL:** `http://localhost:3000/visitas/{{visita_id}}/realizada`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "comentarios": "Visita exitosa, cliente muy interesado"
}
```

**✅ Resultado Esperado (200):** Visita marcada como realizada

---

## 📋 CONTRATOS TESTS

### TEST 23: Create Contrato

**Método:** POST  
**URL:** `http://localhost:3000/contratos`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "propiedad_id": "{{propiedad_id}}",
  "cliente_id": "{{client_id}}",
  "tipo": "alquiler",
  "valor_inicial": 1500000,
  "fecha_inicio": "2026-07-01",
  "fecha_fin": "2027-07-01",
  "estado": "activo"
}
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "tipo": "alquiler",
  "valor_inicial": 1500000,
  "estado": "activo"
}
```

**💾 Guarda el ID:** `contrato_id`

---

### TEST 24: Get All Contratos

**Método:** GET  
**URL:** `http://localhost:3000/contratos`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):** Array de contratos

---

### TEST 25: Activate Contrato

**Método:** PATCH  
**URL:** `http://localhost:3000/contratos/{{contrato_id}}/activar`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha_activacion": "2026-07-01"
}
```

**✅ Resultado Esperado (200):** Contrato activado

---

## 💰 CUOTAS TESTS

### TEST 26: Create Cuota

**Método:** POST  
**URL:** `http://localhost:3000/cuotas`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "contrato_id": "{{contrato_id}}",
  "numero": 1,
  "monto": 1500000,
  "fecha_vencimiento": "2026-08-01",
  "estado": "pendiente"
}
```

**✅ Resultado Esperado (201):**
```json
{
  "id": "uuid",
  "numero": 1,
  "monto": 1500000,
  "estado": "pendiente"
}
```

**💾 Guarda el ID:** `cuota_id`

---

### TEST 27: Get Cuotas Pendientes

**Método:** GET  
**URL:** `http://localhost:3000/cuotas/pendientes/listado`  
**Headers:**
```
Authorization: Bearer {{token}}
```

**✅ Resultado Esperado (200):** Array de cuotas sin pagar

---

### TEST 28: Mark Cuota as Pagada

**Método:** PATCH  
**URL:** `http://localhost:3000/cuotas/{{cuota_id}}/pago`  
**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body:**
```json
{
  "monto_pagado": 1500000,
  "fecha_pago": "2026-08-01",
  "metodo_pago": "transferencia"
}
```

**✅ Resultado Esperado (200):** Cuota marcada como pagada

---

## 📧 EMAIL TESTS

### TEST 29: Send Test Email

**Método:** POST  
**URL:** `http://localhost:3000/emails/test`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{}
```

**✅ Resultado Esperado (200):**
```json
{
  "messageId": "<abc123@gmail.com>",
  "response": "250 2.0.0 OK"
}
```

**🔍 Validar:** Revisa email en Gmail afasa030@gmail.com

---

### TEST 30: Send Manual Email

**Método:** POST  
**URL:** `http://localhost:3000/emails/enviar`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "destinatario": "tu_email@gmail.com",
  "asunto": "Recordatorio: Visita Programada",
  "contenido": "<h2>Hola</h2><p>Tu visita está confirmada para mañana a las 3 PM.</p>"
}
```

**✅ Resultado Esperado (200):**
```json
{
  "messageId": "<xyz789@gmail.com>",
  "response": "250 2.0.0 OK"
}
```

---

### TEST 31: Send Email with Variables

**Método:** POST  
**URL:** `http://localhost:3000/emails/plantilla`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "destinatario": "tu_email@gmail.com",
  "asunto": "Hola {{nombre}}, tu propiedad {{propiedad}} tiene una visita",
  "contenido": "<h2>Bienvenido {{nombre}}</h2><p>La propiedad {{propiedad}} en {{ciudad}} está disponible para visita el {{fecha}}.</p>",
  "variables": {
    "nombre": "Juan",
    "propiedad": "Apartamento 3D - Zona Centro",
    "ciudad": "Bogotá",
    "fecha": "2026-06-20"
  }
}
```

**✅ Resultado Esperado (200):** Email con variables reemplazadas

**🔍 Validar:** Todos los {{}} fueron reemplazados en asunto y contenido

---

### TEST 32: Get Notification Types

**Método:** POST  
**URL:** `http://localhost:3000/emails/tipos`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{}
```

**✅ Resultado Esperado (200):**
```json
[
  "RECORDATORIO_VISITA",
  "PAGO_VENCIDO",
  "PAGO_PROXIMO",
  "NUEVA_PROPIEDAD",
  "NUEVO_LEAD",
  "CONFIRMACION_REGISTRO",
  "RESETEO_CONTRASENA",
  "VISITANTE_CONFIRMADO",
  "PROPIEDAD_DISPONIBLE",
  "CONTACTO_CLIENTE"
]
```

---

### TEST 33: Send Notification - PAGO_VENCIDO

**Método:** POST  
**URL:** `http://localhost:3000/emails/notificacion`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "destinatario": "tu_email@gmail.com",
  "tipo": "PAGO_VENCIDO",
  "variables": {
    "numero_cuota": "3",
    "monto": "$1.500.000"
  }
}
```

**✅ Resultado Esperado (200):** Email con subject "⚠️ Pago Vencido - Cuota #3 - $1.500.000"

**🔍 Validar:** Subject contiene emojis y variables correctas

---

### TEST 34: Send Notification - RECORDATORIO_VISITA

**Método:** POST  
**URL:** `http://localhost:3000/emails/notificacion`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "destinatario": "tu_email@gmail.com",
  "tipo": "RECORDATORIO_VISITA",
  "variables": {
    "propiedad": "Casa Moderna - Zona Rosa",
    "fecha": "2026-06-15 10:30 AM"
  }
}
```

**✅ Resultado Esperado (200):** Email con subject "Recordatorio: Visita programada para Casa Moderna - Zona Rosa - 2026-06-15 10:30 AM"

---

### TEST 35: Send Notification - NUEVO_LEAD

**Método:** POST  
**URL:** `http://localhost:3000/emails/notificacion`  
**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "destinatario": "tu_email@gmail.com",
  "tipo": "NUEVO_LEAD",
  "variables": {
    "nombre_cliente": "María González"
  }
}
```

**✅ Resultado Esperado (200):** Email con subject "✨ Nuevo Lead: María González"

---

## ✅ CHECKLIST FINAL

- [ ] Test 1-6: Auth y Users funcionan
- [ ] Test 7-9: Empresas funcionan
- [ ] Test 10-15: Propiedades e imágenes funcionan
- [ ] Test 16-18: Leads funcionan
- [ ] Test 19-22: Visitas funcionan
- [ ] Test 23-25: Contratos funcionan
- [ ] Test 26-28: Cuotas funcionan
- [ ] Test 29-35: Emails funcionan
- [ ] Todos los emails llegan a Gmail
- [ ] Variables se reemplazan correctamente
- [ ] No hay errores 500 en servidor

---

## 🚨 ERRORES COMUNES

| Error | Solución |
|-------|----------|
| 401 Unauthorized | Revisa que {{token}} esté guardado correctamente |
| 404 Not Found | Revisa que {{ids}} existan (GET primero) |
| 400 Bad Request | Revisa JSON body esté bien formado |
| Email no llega | Revisa que esté en spam o carpeta promotions |
| Variables no reemplazan | Revisa sintaxis {{variable}} exacta |
