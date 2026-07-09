import { Contrato, FormaPagoContrato, TipoContrato } from '../entities/contrato.entity';
import { Cuota } from '../../cuotas/entities/cuota.entity';

export interface ContratoPdfData {
  contrato: Contrato;
  empresa: { nombre: string; rut?: string; direccion?: string } | null;
  cliente: { nombre: string; apellido?: string; email?: string; telefono?: string } | null;
  corredor: { nombre: string; email?: string } | null;
  propiedad: { titulo: string; direccion: string; codigo: string } | null;
  cuotas: Cuota[];
}

const TIPO_LABEL: Record<TipoContrato, string> = {
  [TipoContrato.VENTA]: 'VENTA',
  [TipoContrato.ARRIENDO]: 'ARRIENDO',
  [TipoContrato.RESERVA]: 'RESERVA',
};

function formatoMonto(monto: number | string): string {
  const n = Number(monto);
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function formatoFecha(fecha: Date | string | undefined | null): string {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-CL');
}

function escapeHtml(valor: unknown): string {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildContratoHtml(data: ContratoPdfData): string {
  const { contrato, empresa, cliente, corredor, propiedad, cuotas } = data;

  const bloqueFinanciero = (() => {
    if (contrato.forma_pago === FormaPagoContrato.PAGO_UNICO) {
      return `
        <table class="datos">
          <tr><td>Monto total</td><td>${formatoMonto(contrato.monto_total)}</td></tr>
          <tr><td>Fecha de inicio</td><td>${formatoFecha(contrato.fecha_inicio)}</td></tr>
          <tr><td>Fecha de término</td><td>${formatoFecha(contrato.fecha_fin)}</td></tr>
        </table>
      `;
    }

    const notaCuotaMensual = contrato.monto_cuota_mensual
      ? `<p class="nota">Cuota mensual acordada: ${formatoMonto(contrato.monto_cuota_mensual)}, con vencimiento el día ${contrato.dia_pago_mensual ?? '—'} de cada mes.</p>`
      : '';

    if (cuotas.length === 0) {
      return `${notaCuotaMensual}<p class="nota">Las cuotas se generarán automáticamente al activar el contrato.</p>`;
    }

    const filas = cuotas
      .map(
        (c) => `
          <tr>
            <td>${c.numero_cuota}</td>
            <td>${formatoMonto(c.monto_total)}</td>
            <td>${formatoFecha(c.fecha_vencimiento)}</td>
            <td>${escapeHtml(c.estado)}</td>
          </tr>`,
      )
      .join('');

    return `
      <table class="cuotas">
        <thead>
          <tr><th>N° cuota</th><th>Monto</th><th>Vencimiento</th><th>Estado</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    `;
  })();

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; color: #1a1a1a; font-size: 12px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  h2 { font-size: 14px; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .empresa { font-size: 12px; color: #444; }
  .numero { text-align: right; font-size: 12px; color: #444; }
  table.datos { width: 100%; border-collapse: collapse; margin-top: 4px; }
  table.datos td { padding: 4px 0; border-bottom: 1px solid #eee; }
  table.datos td:first-child { color: #666; width: 40%; }
  table.cuotas { width: 100%; border-collapse: collapse; margin-top: 8px; }
  table.cuotas th, table.cuotas td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 11px; }
  table.cuotas th { background: #f5f5f5; }
  .nota { color: #666; font-style: italic; }
  .firmas { display: flex; justify-content: space-between; margin-top: 60px; }
  .firma { width: 45%; text-align: center; }
  .firma .linea { border-top: 1px solid #333; margin-bottom: 6px; margin-top: 50px; }
  .footer { margin-top: 40px; font-size: 10px; color: #888; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <div class="empresa">
      <div><strong>${escapeHtml(empresa?.nombre || 'Empresa')}</strong></div>
      ${empresa?.rut ? `<div>RUT: ${escapeHtml(empresa.rut)}</div>` : ''}
      ${empresa?.direccion ? `<div>${escapeHtml(empresa.direccion)}</div>` : ''}
    </div>
    <div class="numero">
      <div>N° ${escapeHtml(contrato.numero_contrato)}</div>
      <div>Generado: ${formatoFecha(new Date())}</div>
    </div>
  </div>

  <h1>CONTRATO DE ${TIPO_LABEL[contrato.tipo]}</h1>

  <h2>Partes</h2>
  <table class="datos">
    <tr><td>Corredor</td><td>${escapeHtml(corredor?.nombre || '—')} ${corredor?.email ? `(${escapeHtml(corredor.email)})` : ''}</td></tr>
    <tr><td>Cliente</td><td>${escapeHtml(cliente ? `${cliente.nombre} ${cliente.apellido || ''}`.trim() : '—')} ${cliente?.email ? `(${escapeHtml(cliente.email)})` : ''}</td></tr>
    <tr><td>Propiedad</td><td>${escapeHtml(propiedad?.titulo || '—')} — ${escapeHtml(propiedad?.direccion || '')} (${escapeHtml(propiedad?.codigo || '')})</td></tr>
  </table>

  <h2>Condiciones de pago</h2>
  ${bloqueFinanciero}

  ${contrato.observaciones ? `<h2>Observaciones</h2><p>${escapeHtml(contrato.observaciones)}</p>` : ''}

  <div class="firmas">
    <div class="firma">
      <div class="linea"></div>
      Firma Corredor
    </div>
    <div class="firma">
      <div class="linea"></div>
      Firma Cliente
    </div>
  </div>

  <div class="footer">
    Documento generado automáticamente por el sistema de gestión — uso interno, no constituye asesoría legal.
  </div>
</body>
</html>`;
}
