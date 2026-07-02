# Base de Datos — Inmuebles Chile

Contenido de esta carpeta:

- **`base_datos_inmueble.txt`** — migraciones SQL del proyecto (columnas y tablas
  agregadas sobre el esquema base). Ejecutar en PostgreSQL con DataGrip o psql.
- **`datos_de_prueba.txt`** — datos de ejemplo para poblar la base.
- **`base_datos_completa.sql`** — volcado completo de la base de datos real:
  tipos ENUM, todas las tablas, claves primarias/foráneas, índices y datos.
  Ejecutar sobre una base vacía para recrear el sistema completo.
- **`generar_base_completa.js`** — script que genera `base_datos_completa.sql`
  automáticamente desde la base PostgreSQL del proyecto.

## Cómo regenerar el volcado completo

Con la base de datos accesible (servicio Aiven encendido), ejecutar desde la
raíz del proyecto:

```bash
node BaseDeDatos/generar_base_completa.js backend BaseDeDatos/base_datos_completa.sql
```

El script lee las credenciales del archivo `backend/.env` y usa el driver `pg`
ya instalado en el backend (no requiere instalar nada extra).
