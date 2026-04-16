import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign
} from 'docx';
import api from '../services/api';

// ============================
// ESTILOS Y CONSTANTES
// ============================

// Colores principales: verde y negro / grises oscuros
const COLORS = {
  primary: '#1B5E20',      // verde oscuro profesional
  primaryLight: '#2E7D32', // verde medio
  accent: '#4CAF50',       // verde vibrante para acentos
  accentSoft: '#81C784',   // verde suave para fondos
  textDark: '#1F2937',     // casi negro
  textMedium: '#374151',   // gris oscuro
  textLight: '#6B7280',    // gris secundario
  border: '#D1D5DB',       // gris claro para bordes
  bgWhite: '#FFFFFF',
  bgLight: '#F9FAFB',
  bgHighlight: '#F0FDF4'   // verde muy claro
};

// Tamaños de fuente en half-points (docx)
const SIZES = {
  TITLE: 44,       // 22pt
  SUBTITLE: 28,    // 14pt
  HEADING: 24,     // 12pt
  NORMAL: 22,      // 11pt
  LABEL: 20,       // 10pt
  SMALL: 18,       // 9pt
  TABLE_HEADER: 18 // 9pt
};

// Bordes profesionales
const thinBorder = (color = COLORS.border) => ({
  top: { style: BorderStyle.SINGLE, size: 4, color },
  bottom: { style: BorderStyle.SINGLE, size: 4, color },
  left: { style: BorderStyle.SINGLE, size: 4, color },
  right: { style: BorderStyle.SINGLE, size: 4, color }
});

const noBorder = () => {
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  return { top: none, bottom: none, left: none, right: none };
};

// Helper para crear TextRun con estilo por defecto
const run = (text, opts = {}) => new TextRun({
  text: String(text),
  font: 'Calibri',
  size: opts.size || SIZES.NORMAL,
  color: opts.color || COLORS.textDark,
  ...opts
});

// Helper para párrafos con espaciado uniforme
const para = (children, opts = {}) => new Paragraph({
  children,
  spacing: { before: 80, after: 80, line: 276 },
  ...opts
});

// Helper para celdas de tabla con bordes, fondo y márgenes
const cell = (children, { bg, borders, width, align = VerticalAlign.CENTER } = {}) => {
  const cfg = {
    children,
    borders: borders || noBorder(),
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    verticalAlign: align,
  };
  if (bg) cfg.shading = { fill: bg, type: ShadingType.CLEAR };
  if (width) cfg.width = { size: width, type: WidthType.DXA };
  return new TableCell(cfg);
};

// Formateo de fecha en español
const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
};

// Formateo de moneda
const currency = (value) => `$${(Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ============================
// MAPEO DE DATOS (sin cambios funcionales)
// ============================

function mapFacturaToInvoice(raw) {
  const data = raw?.data ?? raw ?? {};
  const itemsRaw = data?.items ?? data?.detalles ?? data?.productos ?? data?.line_items ?? [];
  const list = Array.isArray(itemsRaw) ? itemsRaw : Object.values(itemsRaw || {});

  const items = list.map((it) => {
    const cantidad = Number(it?.cantidad ?? it?.qty ?? 1) || 0;
    const precio = Number(it?.precio_unitario ?? it?.precio ?? it?.price ?? 0) || 0;
    const total = Number(it?.total ?? (cantidad * precio)) || 0;
    return {
      codigo: it?.codigo ?? it?.id ?? '',
      nombre: it?.nombre ?? it?.producto_nombre ?? 'Producto',
      descripcion: it?.descripcion ?? it?.detalle ?? '',
      cantidad,
      precio_unitario: precio,
      total,
    };
  });

  const subtotal = Number(data?.subtotal ?? items.reduce((s, it) => s + it.total, 0)) || 0;
  const iva = Number(data?.iva ?? 0);
  const total = Number(data?.total ?? (subtotal + iva)) || subtotal;

  return {
    numero_factura: data?.numero_factura ?? data?.id ?? 'S/N',
    fecha_emision: data?.fecha_emision ?? data?.created_at ?? new Date().toISOString(),
    cliente_nombre: data?.cliente_nombre ?? (data?.cliente?.nombre ? `${data.cliente.nombre} ${data.cliente?.apellido ?? ''}`.trim() : 'Consumidor Final'),
    cliente_id: data?.cliente_id ?? data?.cliente?.id ?? 'N/A',
    mascota_nombre: data?.mascota_nombre ?? data?.mascota?.nombre ?? 'N/A',
    mascota_id: data?.mascota_id ?? data?.mascota?.id ?? 'N/A',
    metodo_pago: data?.metodo_pago ?? 'Pendiente',
    items,
    subtotal,
    iva,
    total,
  };
}

// ============================
// GENERACIÓN DEL DOCUMENTO PROFESIONAL
// ============================

export async function generateInvoiceDocx(invoice) {
  const TW = 9360; // Ancho total de la página en DXA
  const colWidths = [1100, 2300, 2800, 800, 1100, 1260]; // Ajuste para mejor distribución
  const headers = ['CÓDIGO', 'PRODUCTO', 'DESCRIPCIÓN', 'CANT.', 'P. UNIT.', 'TOTAL'];

  // ---- Cabecera de la tabla (verde oscuro con texto blanco) ----
  const headerRow = new TableRow({
    children: headers.map((h, i) =>
      cell([
        para([run(h, { bold: true, size: SIZES.TABLE_HEADER, color: COLORS.bgWhite })], {
          alignment: i >= 3 ? AlignmentType.RIGHT : AlignmentType.LEFT
        })
      ], {
        bg: COLORS.primary,
        width: colWidths[i],
        borders: thinBorder(COLORS.primary)
      })
    )
  });

  // ---- Filas de productos (alternando colores sutiles) ----
  const itemRows = invoice.items.map((it, idx) => new TableRow({
    children: [
      cell([para([run(it.codigo || '-', { size: SIZES.SMALL, color: COLORS.textMedium })])],
        { bg: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgLight, borders: thinBorder(), width: colWidths[0] }),
      cell([para([run(it.nombre, { bold: true, size: SIZES.NORMAL })])],
        { bg: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgLight, borders: thinBorder(), width: colWidths[1] }),
      cell([para([run(it.descripcion, { size: SIZES.SMALL, color: COLORS.textLight })])],
        { bg: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgLight, borders: thinBorder(), width: colWidths[2] }),
      cell([para([run(String(it.cantidad), { size: SIZES.NORMAL })], { alignment: AlignmentType.RIGHT })],
        { bg: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgLight, borders: thinBorder(), width: colWidths[3] }),
      cell([para([run(currency(it.precio_unitario), { size: SIZES.NORMAL })], { alignment: AlignmentType.RIGHT })],
        { bg: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgLight, borders: thinBorder(), width: colWidths[4] }),
      cell([para([run(currency(it.total), { bold: true, size: SIZES.NORMAL, color: COLORS.primary })], { alignment: AlignmentType.RIGHT })],
        { bg: idx % 2 === 0 ? COLORS.bgWhite : COLORS.bgLight, borders: thinBorder(), width: colWidths[5] }),
    ]
  }));

  // ---- Documento final ----
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        // ---- ENCABEZADO PRINCIPAL con logo textual y datos de la empresa ----
        new Table({
          width: { size: TW, type: WidthType.DXA },
          columnWidths: [5500, 3860],
          rows: [new TableRow({
            children: [
              cell([
                para([run('🐾 VetClinic', { bold: true, size: SIZES.TITLE, font: 'Calibri', color: COLORS.primary })]),
                para([run('Clínica Veterinaria Especializada', { size: SIZES.SUBTITLE, color: COLORS.textMedium })], { spacing: { after: 80 } }),
                para([run('Av. Principal 123 · Ciudad · CP 12345', { size: SIZES.LABEL, color: COLORS.textLight })]),
                para([run('Tel: (555) 123-4567 · hola@vetclinic.com', { size: SIZES.LABEL, color: COLORS.textLight })]),
              ], { width: 5500 }),
              cell([
                para([run('FACTURA', { bold: true, size: 38, color: COLORS.bgWhite })], { alignment: AlignmentType.CENTER }),
                para([run(invoice.numero_factura, { bold: true, size: 26, color: COLORS.bgWhite })], { alignment: AlignmentType.CENTER }),
                para([run(`Fecha: ${formatDate(invoice.fecha_emision)}`, { size: 20, color: COLORS.bgWhite })], { alignment: AlignmentType.CENTER }),
              ], { width: 3860, bg: COLORS.primaryLight, borders: thinBorder(COLORS.primaryLight) }),
            ]
          })]
        }),

        // ---- INFORMACIÓN DEL CLIENTE Y MASCOTA (con diseño de tarjeta) ----
        new Table({
          width: { size: TW, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [new TableRow({
            children: [
              cell([
                para([run('●  CLIENTE', { bold: true, size: SIZES.HEADING, color: COLORS.primary })]),
                para([run(invoice.cliente_nombre, { bold: true, size: SIZES.NORMAL, color: COLORS.textDark })]),
                para([run(`ID: ${invoice.cliente_id}`, { size: SIZES.SMALL, color: COLORS.textLight })], { spacing: { after: 0 } }),
              ], { bg: COLORS.bgHighlight, borders: thinBorder(COLORS.accentSoft) }),
              cell([
                para([run('●  MASCOTA', { bold: true, size: SIZES.HEADING, color: COLORS.primary })], { alignment: AlignmentType.RIGHT }),
                para([run(invoice.mascota_nombre, { bold: true, size: SIZES.NORMAL, color: COLORS.textDark })], { alignment: AlignmentType.RIGHT }),
                para([run(`ID: ${invoice.mascota_id}`, { size: SIZES.SMALL, color: COLORS.textLight })], { alignment: AlignmentType.RIGHT, spacing: { after: 0 } }),
              ], { bg: COLORS.bgHighlight, borders: thinBorder(COLORS.accentSoft) }),
            ]
          })]
        }),

        para([run('')], { spacing: { after: 200 } }),

        // ---- TABLA DE PRODUCTOS/SERVICIOS ----
        new Table({
          width: { size: TW, type: WidthType.DXA },
          columnWidths: colWidths,
          rows: [headerRow, ...itemRows]
        }),

        // ---- TOTALES (alineados a la derecha con diseño elegante) ----
        new Table({
          width: { size: TW, type: WidthType.DXA },
          columnWidths: [5860, 2000, 1500],
          rows: [
            new TableRow({
              children: [
                cell([], { width: 5860 }),
                cell([para([run('Subtotal', { size: SIZES.NORMAL, color: COLORS.textMedium })], { alignment: AlignmentType.RIGHT })], { borders: noBorder() }),
                cell([para([run(currency(invoice.subtotal), { size: SIZES.NORMAL, bold: true })], { alignment: AlignmentType.RIGHT })], { borders: noBorder() }),
              ]
            }),
            new TableRow({
              children: [
                cell([], { width: 5860 }),
                cell([para([run('IVA (16%)', { size: SIZES.NORMAL, color: COLORS.textMedium })], { alignment: AlignmentType.RIGHT })], { borders: noBorder() }),
                cell([para([run(currency(invoice.iva), { size: SIZES.NORMAL, bold: true })], { alignment: AlignmentType.RIGHT })], { borders: noBorder() }),
              ]
            }),
            new TableRow({
              children: [
                cell([para([run(`Método de pago: ${invoice.metodo_pago}`, { italic: true, size: SIZES.SMALL, color: COLORS.textLight })])], { borders: noBorder() }),
                cell([para([run('TOTAL', { bold: true, size: 32, color: COLORS.primary })], { alignment: AlignmentType.RIGHT })],
                  { bg: COLORS.bgHighlight, borders: thinBorder(COLORS.accentSoft) }),
                cell([para([run(currency(invoice.total), { bold: true, size: 32, color: COLORS.primaryLight })], { alignment: AlignmentType.RIGHT })],
                  { bg: COLORS.bgHighlight, borders: thinBorder(COLORS.accentSoft) }),
              ]
            }),
          ]
        }),

        // ---- SEPARADOR Y PIE DE PÁGINA CON AGRADECIMIENTO ----
        para([run('')], { spacing: { before: 600 } }),
        new Paragraph({
          children: [new TextRun({ text: '________________________________________________________', color: COLORS.accentSoft, size: 16 })],
          alignment: AlignmentType.CENTER
        }),
        para([
          run('✨ Gracias por confiar en VetClinic. ✨', { bold: true, size: SIZES.NORMAL, color: COLORS.primary }),
        ], { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 60 } }),
        para([
          run('Si tienes alguna duda o necesitas asistencia, contáctanos a hola@vetclinic.com o al (555) 123-4567', { size: SIZES.SMALL, color: COLORS.textLight }),
        ], { alignment: AlignmentType.CENTER }),
        para([
          run('Este documento es una factura oficial válida para efectos fiscales.', { size: SIZES.SMALL, color: COLORS.textLight, italic: true }),
        ], { alignment: AlignmentType.CENTER, spacing: { before: 100 } }),
      ]
    }]
  });

  return await Packer.toBlob(doc);
}

// ============================
// FUNCIÓN PRINCIPAL PARA CITA (compatible con la original)
// ============================
export async function generateInvoiceForCita(citaId) {
  if (!citaId) throw new Error('citaId is required');
  const safeId = encodeURIComponent(String(citaId));

  // Usar exclusivamente el endpoint del servidor para generar/obtener la factura PDF
  const resp = await api.request(`/Facturas/cita/${safeId}/pdf`, { method: 'POST' });
  if (!resp) {
    const e = new Error('El servidor no devolvió respuesta al solicitar la factura');
    e.status = 502;
    throw e;
  }

  const file = resp?.file ?? resp?.invoice_file ?? resp?.fileName ?? resp?.filename ?? null;
  const url = resp?.url ?? resp?.invoice_url ?? resp?.file_url ?? resp?.link ?? null;

  if (!file && !url) {
    const err = new Error('El servidor no devolvió `file` ni `url` para la factura');
    err.body = resp;
    throw err;
  }

  return { file, url, raw: resp };
}

export { mapFacturaToInvoice };