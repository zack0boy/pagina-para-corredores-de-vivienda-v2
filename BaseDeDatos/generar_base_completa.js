// Genera un script SQL completo (CREATE TABLE + PK/FK/UNIQUE + índices + datos)
// desde la base PostgreSQL del proyecto (lee credenciales del .env del backend).
const fs = require('fs');
const path = require('path');

const backendDir = process.argv[2];
const salida = process.argv[3];

// Parse .env manualmente
const env = {};
for (const linea of fs.readFileSync(path.join(backendDir, '.env'), 'utf8').split(/\r?\n/)) {
  const m = linea.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const { Client } = require(path.join(backendDir, 'node_modules', 'pg'));

(async () => {
  const client = new Client({
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 5432),
    user: env.DB_USERNAME || env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: (env.DB_SSL === 'true') ? { rejectUnauthorized: false } : false,
  });
  await client.connect();

  const out = [];
  out.push('-- ============================================================');
  out.push('--  BASE DE DATOS COMPLETA - Inmuebles Chile (SaaS Corredores)');
  out.push(`--  Generado automáticamente el ${new Date().toISOString().slice(0, 10)} desde PostgreSQL (Aiven)`);
  out.push('--  Incluye: tipos ENUM, tablas, PK/FK/UNIQUE, índices y datos.');
  out.push('--  Ejecutar sobre una base vacía (esquema public).');
  out.push('-- ============================================================\n');
  out.push('CREATE EXTENSION IF NOT EXISTS pgcrypto;\n');

  // 1) ENUMs
  const enums = await client.query(`
    SELECT t.typname, array_agg(e.enumlabel ORDER BY e.enumsortorder) AS labels
    FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname ORDER BY t.typname`);
  out.push('-- ─── TIPOS ENUM ───');
  for (const r of enums.rows) {
    out.push(`CREATE TYPE "${r.typname}" AS ENUM (${r.labels.map((l) => `'${l}'`).join(', ')});`);
  }
  out.push('');

  // 2) Tablas
  const tablas = (await client.query(`
    SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`)).rows.map((r) => r.tablename);

  const colsQ = await client.query(`
    SELECT table_name, column_name, ordinal_position, udt_name, data_type,
           character_maximum_length, numeric_precision, numeric_scale,
           is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema='public' ORDER BY table_name, ordinal_position`);

  const tipoSQL = (c) => {
    if (c.data_type === 'USER-DEFINED') return `"${c.udt_name}"`;
    if (c.data_type === 'character varying') return c.character_maximum_length ? `VARCHAR(${c.character_maximum_length})` : 'VARCHAR';
    if (c.data_type === 'numeric' && c.numeric_precision) return `NUMERIC(${c.numeric_precision},${c.numeric_scale ?? 0})`;
    if (c.data_type === 'timestamp without time zone') return 'TIMESTAMP';
    if (c.data_type === 'timestamp with time zone') return 'TIMESTAMPTZ';
    if (c.data_type === 'ARRAY') return `${c.udt_name.replace(/^_/, '')}[]`;
    return c.data_type.toUpperCase();
  };

  out.push('-- ─── TABLAS ───');
  for (const t of tablas) {
    const cols = colsQ.rows.filter((c) => c.table_name === t);
    const lineas = cols.map((c) => {
      let l = `  "${c.column_name}" ${tipoSQL(c)}`;
      if (c.is_nullable === 'NO') l += ' NOT NULL';
      if (c.column_default) l += ` DEFAULT ${c.column_default}`;
      return l;
    });
    out.push(`CREATE TABLE "${t}" (\n${lineas.join(',\n')}\n);\n`);
  }

  // 3) Constraints (PK, UNIQUE, FK, CHECK)
  const cons = await client.query(`
    SELECT conrelid::regclass::text AS tabla, conname, pg_get_constraintdef(oid) AS def, contype
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
    ORDER BY CASE contype WHEN 'p' THEN 1 WHEN 'u' THEN 2 WHEN 'f' THEN 3 ELSE 4 END, conrelid::regclass::text`);
  out.push('-- ─── RESTRICCIONES (PK / UNIQUE / FK / CHECK) ───');
  for (const r of cons.rows) {
    out.push(`ALTER TABLE ${r.tabla} ADD CONSTRAINT "${r.conname}" ${r.def};`);
  }
  out.push('');

  // 4) Índices (no los de constraints)
  const idx = await client.query(`
    SELECT indexdef FROM pg_indexes
    WHERE schemaname='public'
      AND indexname NOT IN (SELECT conname FROM pg_constraint WHERE connamespace='public'::regnamespace)
    ORDER BY tablename, indexname`);
  out.push('-- ─── ÍNDICES ───');
  for (const r of idx.rows) out.push(`${r.indexdef};`);
  out.push('');

  // 5) Datos
  out.push('-- ─── DATOS ───');
  const escapar = (v) => {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (v instanceof Date) return `'${v.toISOString()}'`;
    if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
    return `'${String(v).replace(/'/g, "''")}'`;
  };

  for (const t of tablas) {
    const datos = await client.query(`SELECT * FROM "${t}" LIMIT 200`);
    if (datos.rows.length === 0) continue;
    const columnas = datos.fields.map((f) => `"${f.name}"`).join(', ');
    out.push(`-- Datos de ${t} (${datos.rows.length} filas)`);
    for (const fila of datos.rows) {
      const valores = datos.fields.map((f) => escapar(fila[f.name])).join(', ');
      out.push(`INSERT INTO "${t}" (${columnas}) VALUES (${valores});`);
    }
    out.push('');
  }

  fs.writeFileSync(salida, out.join('\n'), 'utf8');
  console.log(`OK: ${tablas.length} tablas, ${enums.rows.length} enums, ${cons.rows.length} constraints, ${idx.rows.length} indices -> ${salida}`);
  await client.end();
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
