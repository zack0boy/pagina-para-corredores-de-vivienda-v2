# 🏠 Inmuebles Chile — Manual de Instalación y Ejecución

Sistema web para corredores de propiedades: catálogo de inmuebles, gestión por
corredores, solicitudes de clientes, pagos, calendario y más.

Este manual explica **todo lo que un tercero necesita** para dejar el proyecto
corriendo desde cero en una máquina local.

---

## 1. Arquitectura del proyecto

El sistema tiene **dos partes separadas** (dos carpetas / dos repos):

| Parte | Tecnología | Puerto | Carpeta |
|-------|-----------|--------|---------|
| **Backend** (API) | NestJS + TypeORM | `3000` | `.../pagina-para-corredores-de-vivienda-v2/backend` |
| **Frontend** (web) | Angular 19 | `4200` | `.../programas/frontend/frontend` |

Servicios externos que usa:
- **PostgreSQL** (base de datos, alojada en Aiven).
- **Cloudinary** (almacenamiento de imágenes de propiedades y comprobantes).
- **Gmail SMTP** (envío de correos: verificación y recuperación de contraseña).
- **Google OAuth + Calendar** (login con Google y sincronización de calendario).

```
Usuario  ─►  Frontend (Angular :4200)  ─►  Backend (NestJS :3000)  ─►  PostgreSQL (Aiven)
                                                     │
                                                     ├─► Cloudinary (imágenes)
                                                     ├─► Gmail SMTP (correos)
                                                     └─► Google (login / calendario)
```

---

## 2. Requisitos previos

Instalar una sola vez en la máquina:

- **Node.js 18 o 20 LTS** → https://nodejs.org
- **npm** (viene con Node)
- **Git** (para clonar los repositorios) → https://git-scm.com
- **DataGrip** o cualquier cliente PostgreSQL (para ejecutar el SQL)
- (Opcional) **Angular CLI**: `npm install -g @angular/cli`

Verificar instalación:
```bash
node -v
npm -v
```

---

## 3. Estructura de carpetas

```
pagina-para-corredores-de-vivienda-v2/
├── backend/                 # API NestJS
│   ├── src/                 # código fuente
│   ├── .env                 # ⚠️ configuración y secretos (NO se sube a Git)
│   └── package.json
├── BaseDeDatos/
│   └── migraciones_base_datos.txt   # SQL de las tablas/columnas del proyecto
└── MANUAL.md                # este archivo

programas/frontend/frontend/  # App Angular
├── src/
│   └── environments/         # environment.ts (dev) y environment.prod.ts (prod)
└── package.json
```

---

## 4. Configuración de la base de datos

1. Abrir **DataGrip** y conectar a la base PostgreSQL.
2. Ejecutar el script:
   ```
   BaseDeDatos/migraciones_base_datos.txt
   ```
   Esto crea/actualiza las tablas del proyecto (imágenes, pagos, calendario,
   solicitudes de publicación, ficha de corredor, historial, etc.).

> ℹ️ Si la base está **vacía por completo**, primero deben existir las tablas
> base (`empresas`, `usuarios`, `clientes`, `categorias`, `propiedades`,
> `propiedad_imagenes`, `pagos`, `comprobantes`, `solicitudes_cliente`,
> `eventos_calendario`, `password_resets`). Las migraciones asumen que ya existen.

---

## 5. Configuración del backend (`.env`)

En la carpeta `backend/` debe existir un archivo llamado **`.env`** con estas
variables (pídelas al responsable del proyecto; **nunca** se suben a Git):

```env
# Base de datos (PostgreSQL / Aiven)
DB_TYPE=postgres
DB_HOST=xxxxx.aivencloud.com
DB_PORT=xxxxx
DB_USERNAME=xxxxx
DB_PASSWORD=xxxxx
DB_NAME=defaultdb
DB_SSL=true

# Seguridad
JWT_SECRET=una-clave-secreta-larga
TOKEN_EXPIRATION=1d

# Cloudinary (imágenes)
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# Correo (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tucorreo@gmail.com
SMTP_PASS=clave-de-aplicacion-de-gmail

# Google (login + calendario)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/redirect
GOOGLE_REFRESH_TOKEN=1//xxxxx      # necesario para sincronizar el calendario
```

> Si falta `GOOGLE_REFRESH_TOKEN`, el calendario local funciona igual, solo que
> no se sincroniza con Google.

---

## 6. Ejecutar el BACKEND

Abrir una terminal en la carpeta `backend/`:

```bash
npm install          # instala dependencias (solo la 1ª vez)
npm run start:dev    # modo desarrollo (recarga automática)
```

Para **modo producción local** (más estable):
```bash
npm run build
npm run start:prod
```

El backend queda escuchando en:
```
http://localhost:3000
```
Dejar esta terminal abierta.

---

## 7. Ejecutar el FRONTEND

Abrir **otra** terminal en la carpeta del frontend
(`programas/frontend/frontend`):

```bash
npm install          # instala dependencias (solo la 1ª vez)
npm start            # levanta la app en http://localhost:4200
```

Abrir el navegador en:
```
http://localhost:4200
```

### Build de producción del frontend (opcional)
```bash
npm run build -- --configuration=production
```
Genera la carpeta `dist/frontend/browser`, que se puede servir con cualquier
servidor estático (ej: `npm install -g http-server` y luego
`http-server dist/frontend/browser -p 4200`).

> La URL del backend que usa el frontend se define en
> `src/environments/environment.ts` (desarrollo) y
> `src/environments/environment.prod.ts` (producción).
> Para uso local debe ser `apiUrl: 'http://localhost:3000'`.

---

## 8. Orden correcto de arranque

1. Ejecutar las migraciones en la base de datos.
2. **Terminal 1** → backend → `npm run start:dev` → `localhost:3000`
3. **Terminal 2** → frontend → `npm start` → `localhost:4200`
4. Abrir `http://localhost:4200`

---

## 9. Roles y cómo probar

El sistema maneja estos actores:

| Rol | Cómo se crea | Qué puede hacer |
|-----|--------------|-----------------|
| **Cliente** | Se registra en `/registro` (verifica su correo con un código) | Ver catálogo, contactar corredor |
| **Corredor** | Lo crea un admin en la tabla `usuarios` (rol `CORREDOR`) | Panel completo: propiedades, pagos, calendario, etc. |
| **Admin / Super Admin** | En la tabla `usuarios` con su rol | Dashboards y administración |

- **Login con Google:** el correo debe existir en la base; si no, se crea como Cliente.
- **Correos de prueba:** en `backend/src/email/email.service.ts` la variable
  `MODO_PRUEBAS = true` hace que todos los correos lleguen a un correo de prueba.
  Cambiar a `false` para enviar a los correos reales.

---

## 10. Funcionalidades principales

- **Catálogo** de propiedades con filtros y buscador.
- **Detalle** de propiedad con carrusel de imágenes (zoom/lupa) y mapa.
- **Panel del corredor:** dashboard, nueva propiedad (con mapa + subida de
  imágenes), edición y orden de imágenes, mis propiedades, historial de cambios.
- **Solicitudes de publicación:** una persona pide publicar y el corredor aprueba
  (queda como representante).
- **Solicitudes de cliente:** el corredor aprueba/rechaza el acceso de clientes.
- **Pagos:** registro manual con evidencia (comprobante) y buscador de propiedad.
- **Calendario:** vista de mes, crear/editar eventos, sincroniza con Google.
- **Perfil del corredor:** editar licencia y descripción.

---

## 11. Problemas comunes (troubleshooting)

| Síntoma | Causa / Solución |
|---------|------------------|
| Frontend dice "no conecta con el servidor" | El backend no está corriendo, o `environment` apunta a otra URL |
| Error 500 `column ... does not exist` | Faltan migraciones → ejecutar `migraciones_base_datos.txt` |
| Error 400 al guardar formularios | Reiniciar el backend tras cambios; revisar campos obligatorios |
| El calendario no aparece en Google | Falta `GOOGLE_REFRESH_TOKEN` en el `.env` |
| Las imágenes no suben | Revisar credenciales `CLOUDINARY_*` en el `.env` |
| No llegan correos al usuario real | `MODO_PRUEBAS = true` en `email.service.ts` (cambiar a `false`) |
| Login con Google da "acceso bloqueado" | Agregar el correo como *usuario de prueba* en Google Cloud Console |

---

## 12. Notas de seguridad

- El archivo **`.env` nunca se sube a Git** (está en `.gitignore`).
- Las credenciales usadas en desarrollo deben **rotarse** antes de un despliegue
  real en internet.
- `JWT_SECRET` debe ser una cadena larga y aleatoria en producción.

---

## 13. Comandos rápidos (resumen)

```bash
# BACKEND (carpeta backend)
npm install
npm run start:dev            # desarrollo
npm run start:prod           # producción local (tras npm run build)

# FRONTEND (carpeta frontend)
npm install
npm start                    # desarrollo -> localhost:4200
npm run build -- --configuration=production   # build producción
```

---

*Manual generado para el proyecto Inmuebles Chile — corredores de vivienda.*
