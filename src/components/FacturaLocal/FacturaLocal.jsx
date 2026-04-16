import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { getIcon } from '../../assets/icons/ExportIcon/Index';

const C = {
  bg:          '#0A0E1A',
  bgCard:      '#0D1A2A',
  bgHeader:    '#0D2137',
  bgRowAlt:    '#111827',
  bgTotal:     '#012A1A',
  accent:      '#00C896',
  accentDim:   '#009E78',
  gold:        '#F0C040',
  text:        '#E8F4F8',
  textMuted:   '#7A9BB5',
  textDim:     '#4A6A85',
  border:      '#1E3A52',
  borderLight: '#243F58',
  white:       '#FFFFFF',
};

const fonts = {
  display: "'DM Mono', 'Fira Code', 'Consolas', monospace",
  body:    "'Syne', 'Segoe UI', system-ui, sans-serif",
};

/* ─── Estilos ─────────────────────────────────────────────────────────────── */
const s = {
  // Contenedor raíz
  root: {
    fontFamily: fonts.body,
    background: C.bg,
    color: C.text,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '2rem 1rem',
    boxSizing: 'border-box',
  },

  // Tarjeta principal
  card: {
    width: '100%',
    maxWidth: '860px',
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: `0 0 0 1px ${C.border}, 0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,200,150,0.04)`,
    position: 'relative',
  },

  // Banda superior de acento
  topBand: {
    height: '4px',
    background: `linear-gradient(90deg, ${C.accent} 0%, ${C.accentDim} 60%, transparent 100%)`,
  },

  // Header
  header: {
    background: C.bgHeader,
    padding: '2rem 2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
    borderBottom: `1px solid ${C.border}`,
    flexWrap: 'wrap',
  },

  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },

  logoMark: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },

  logoIcon: {
    width: '32px',
    height: '32px',
    background: C.accent,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },

  h1: {
    fontFamily: fonts.body,
    fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
    fontWeight: 700,
    color: C.accent,
    margin: 0,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    lineHeight: 1,
  },

  h2: {
    fontFamily: fonts.body,
    fontSize: 'clamp(0.7rem, 2vw, 0.82rem)',
    fontWeight: 400,
    color: C.textMuted,
    margin: 0,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },

  brandDetails: {
    fontFamily: fonts.display,
    fontSize: '0.72rem',
    color: C.textDim,
    marginTop: '0.4rem',
      display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },

  // Badge de factura
  invoiceBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.3rem',
    flexShrink: 0,
  },

  badgeLabel: {
    background: C.accent,
    color: C.bg,
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: '0.65rem',
    letterSpacing: '0.18em',
    padding: '0.25rem 0.8rem',
    borderRadius: '2px',
    textTransform: 'uppercase',
    marginBottom: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },

  invoiceNumber: {
    fontFamily: fonts.display,
    fontSize: 'clamp(1rem, 3vw, 1.3rem)',
    fontWeight: 600,
    color: C.white,
    letterSpacing: '0.04em',
      display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },

  invoiceDate: {
    fontFamily: fonts.display,
    fontSize: '0.78rem',
    color: C.textMuted,
      display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',

  },

  // Separador
  divider: (color = C.accentDim, height = '1px') => ({
    height,
    background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
    margin: 0,
    border: 'none',
  }),

  // Sección info cliente/mascota
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0',
    borderBottom: `1px solid ${C.border}`,
  },

  infoBlock: (align = 'left') => ({
    padding: '1.5rem 2.5rem',
    borderRight: align === 'left' ? `1px solid ${C.border}` : 'none',
    textAlign: align,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  }),

  infoLabel: {
    fontFamily: fonts.body,
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: C.accent,
    textTransform: 'uppercase',
    marginBottom: '0.2rem',
      display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    
  },
  icon: {
    width: '16px',
    height: '16px',
    filter: 'invert(1)',
    flexShrink: 0,
  },

  infoName: {
    fontFamily: fonts.body,
    fontSize: '1.05rem',
    fontWeight: 600,
    color: C.text,
    margin: 0,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    display: 'block',
  },

  infoId: {
    fontFamily: fonts.display,
    fontSize: '0.74rem',
    color: C.textMuted,
  },

  // Sección etiqueta
  sectionLabel: {
    padding: '1.25rem 2.5rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  sectionBar: {
    width: '3px',
    height: '1rem',
    background: C.accent,
    borderRadius: '2px',
    flexShrink: 0,
  },

  sectionText: {
    fontFamily: fonts.body,
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.18em',
    color: C.accent,
    textTransform: 'uppercase',
  },

  // Tabla
  tableWrap: {
    overflowX: 'auto',
    padding: '0 0 0.5rem',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: fonts.body,
    fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
  },

  thead: {
    background: C.bgHeader,
  },

  th: (align = 'left') => ({
    padding: '0.75rem 1rem 0.75rem 1.5rem',
    color: C.accent,
    fontWeight: 700,
    fontSize: '0.65rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textAlign: align,
    borderBottom: `2px solid ${C.border}`,
    whiteSpace: 'nowrap',
  }),

  td: (align = 'left', alt = false) => ({
    padding: '0.8rem 1rem 0.8rem 1.5rem',
    color: C.text,
    textAlign: align,
    borderBottom: `1px solid ${C.border}`,
    background: alt ? C.bgRowAlt : C.bgCard,
    verticalAlign: 'middle',
  }),

  tdCode: {
    fontFamily: fonts.display,
    color: C.textMuted,
    fontSize: '0.8rem',
  },

  tdMoney: {
    fontFamily: fonts.display,
    fontWeight: 500,
  },

  tdMoneyBold: {
    fontFamily: fonts.display,
    fontWeight: 700,
    color: C.white,
  },

  itemNombre: {
    display: 'block',
    fontWeight: 600,
    color: C.text,
  },

  itemDesc: {
    display: 'block',
    fontSize: '0.75rem',
    color: C.textMuted,
    marginTop: '0.15rem',
  },

  // Sección totales
  totalesSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '1.5rem',
    padding: '1.5rem 2.5rem 2rem',
    borderTop: `1px solid ${C.border}`,
  },

  paymentBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  paymentLabel: {
    fontFamily: fonts.body,
    fontSize: '0.65rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: C.textDim,
  },

  paymentValue: {
    fontFamily: fonts.display,
    fontSize: '0.9rem',
    color: C.textMuted,
  },

  estadoBadge: (isPending) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.3rem 0.75rem',
    borderRadius: '2px',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontFamily: fonts.body,
    background: isPending ? 'rgba(240,192,64,0.12)' : 'rgba(0,200,150,0.12)',
    color: isPending ? C.gold : C.accent,
    border: `1px solid ${isPending ? 'rgba(240,192,64,0.3)' : 'rgba(0,200,150,0.3)'}`,
    marginTop: '0.5rem',
    width: 'fit-content',
  }),

  totalesTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    minWidth: '240px',
    border: `1px solid ${C.border}`,
    borderRadius: '3px',
    overflow: 'hidden',
  },

  totalesRow: (isTotal = false) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isTotal ? '0.9rem 1.25rem' : '0.6rem 1.25rem',
    background: isTotal ? C.bgTotal : C.bgCard,
    borderTop: isTotal ? `1px solid ${C.accentDim}` : `1px solid ${C.border}`,
    gap: '2rem',
  }),

  totalesLabel: (isTotal = false) => ({
    fontFamily: fonts.body,
    fontSize: isTotal ? '0.75rem' : '0.75rem',
    fontWeight: isTotal ? 700 : 400,
    letterSpacing: isTotal ? '0.14em' : '0.04em',
    textTransform: isTotal ? 'uppercase' : 'none',
    color: isTotal ? C.accent : C.textMuted,
  }),

  totalesValue: (isTotal = false) => ({
    fontFamily: fonts.display,
    fontSize: isTotal ? '1.15rem' : '0.88rem',
    fontWeight: isTotal ? 700 : 500,
    color: isTotal ? C.gold : C.text,
  }),

  // Footer
  footer: {
    padding: '1rem 2.5rem 1.5rem',
    borderTop: `1px solid ${C.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    alignItems: 'center',
    textAlign: 'center',
  },

  footerText: {
    fontFamily: fonts.display,
    fontSize: '0.72rem',
    color: C.textDim,
    margin: 0,
    
  },
  hp: {
    fontFamily: fonts.display,
    fontSize: '0.72rem',
    color: C.accent,
    margin: 0,
    // backgroundColor: '#f',
    // padding: '0.1rem 0.4rem',
    // borderRadius: '2px',
    // display: 'inline-block',
    // textAlign: 'center',
  },

  // Estados de carga/error
  statusWrap: {
    fontFamily: fonts.body,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: '4px',
    margin: '2rem auto',
    maxWidth: '500px',
  },

  loadingText: {
    color: C.accent,
    fontSize: '0.9rem',
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  errorText: {
    color: '#FF6B6B',
    fontSize: '0.88rem',
    letterSpacing: '0.04em',
  },
};

const injectStyles = () => {
  if (document.getElementById('vf-styles')) return;
  const el = document.createElement('style');
  el.id = 'vf-styles';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    @keyframes vf-spin { to { transform: rotate(360deg); } }
    @keyframes vf-fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .vf-card { animation: vf-fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
    .vf-tr { transition: background 0.15s ease; }
    .vf-tr:hover td { background: #152030 !important; }
    @media (max-width: 600px) {
      .vf-header   { flex-direction: column !important; align-items: flex-start !important; }
      .vf-badge    { align-items: flex-start !important; }
      .vf-infoblk  { border-right: none !important; border-bottom: 1px solid #1E3A52 !important; }
      .vf-totales  { flex-direction: column !important; align-items: stretch !important; }
      .vf-tbl-tbl  { min-width: 100% !important; }
      .vf-th, .vf-td { padding-left: 0.75rem !important; padding-right: 0.5rem !important; }
    }
  `;
  document.head.appendChild(el);
};

const formatDate = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return String(str);
  }
};

const currency = (value) =>
  `$${(Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const idFmt = (id) => id ? `#${String(id).padStart(4, '0')}` : '—';

const Spinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       style={{ animation: 'vf-spin 0.8s linear infinite', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" stroke={C.border} strokeWidth="2.5" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const StatusDot = ({ isPending }) => (
  <span style={{
    width: '6px', height: '6px', borderRadius: '50%',
    background: isPending ? C.gold : C.accent,
    display: 'inline-block', flexShrink: 0,
  }} />
);

const VistaFactura = ({ idCita }) => {
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (!idCita) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.request(`/Facturas/cita/${idCita}`, { method: 'GET' });
        if (!cancelled) setFactura(data);
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Error al cargar la factura');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idCita]);

  if (loading) return (
    <div style={s.root}>
      <div style={s.statusWrap}>
        <p style={s.loadingText}><Spinner /> Cargando factura…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={s.root}>
      <div style={s.statusWrap}>
        <p><img src={getIcon('warning')} style={s.icon} alt="Warning" /> {error}</p>
      </div>
    </div>
  );

  if (!factura) return null;

  const items     = Array.isArray(factura.items) ? factura.items : [];
  const isPending = factura.estado_pago === 'factura_pendiente';
  const subtotal  = factura.subtotal ?? factura.sub_total ?? 0;
  const iva       = factura.iva ?? 0;
  const total     = factura.total ?? 0;

  return (
    <div style={s.root}>
      <div style={s.card} className="vf-card">

        <div style={s.topBand} />

  
        <header style={s.header} className="vf-header">
          <div style={s.logoSection}>
            <div style={s.logoMark}>
              <div style={s.logoIcon}>
                <img src={getIcon('pata')} style={s.icon} alt="Pata Icon" />
              </div>
              <h1 style={s.h1}>Happy Pets</h1>
            </div>
            <h2 style={s.h2}>Clínica Veterinaria Especializada</h2>
            <div style={s.brandDetails}>
              <img src={getIcon('localizacion')} style={s.icon} alt="Localización Icon" />
              Socopo
            </div>
          </div>

          <div style={s.invoiceBadge} className="vf-badge">
            <span style={s.badgeLabel}>
              <img src={getIcon('fileText')} style={s.icon} alt="Factura Icon" />
              Factura
              </span>
            <div style={s.invoiceNumber}>
              <img src={getIcon('hash')} style={s.icon} alt="Hash Icon" />
              {factura.numero_factura || factura.id || 'S/N'}
            </div>
            <div style={s.invoiceDate}>
                <img src={getIcon('calendario')} style={s.icon} alt="Calendario Icon" />
              {formatDate(factura.fecha_emision)}
            
            </div>
          </div>
        </header>


        <hr style={s.divider(C.accent, '2px')} />

       
        <section style={s.infoGrid}>
          <div style={s.infoBlock('left')} className="vf-infoblk">
            <div style={s.infoLabel}>
              <img src={getIcon('user')} style={s.icon} alt="Cliente Icon" />
              Cliente</div>
            <div style={s.infoName}>{factura.cliente_nombre || 'Consumidor Final'}</div>
            <div style={s.infoId}>{idFmt(factura.cliente_id)}</div>
          </div>
          <div style={s.infoBlock('right')} className="vf-infoblk">
            <div style={s.infoLabel}>
              <img src={getIcon('pata')} style={s.icon} alt="Mascota Icon" />
              Mascota</div>
            <div style={s.infoName}>{factura.mascota_nombre || 'N/A'}</div>
            <div style={s.infoId}>{idFmt(factura.mascota_id)}</div>
          </div>
        </section>

   
        <div style={s.sectionLabel}>
          <div style={s.sectionBar} />
          <span style={s.sectionText}>Detalle de Servicios</span>
        </div>


        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead style={s.thead}>
              <tr>
                {[
                  ['CÓDIGO',      'left'],
                  ['PRODUCTO',    'left'],
                  ['CANT.',       'center'],
                  ['P. UNIT.',    'right'],
                  ['TOTAL',       'right'],
                ].map(([h, a]) => (
                  <th key={h} style={s.th(a)} className="vf-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...s.td('center'), color: C.textDim, padding: '2rem', fontStyle: 'italic' }}>
                    Sin servicios registrados.
                  </td>
                </tr>
              ) : items.map((item, i) => {
                const qty   = Number(item?.cantidad ?? item?.qty ?? 1) || 0;
                const price = Number(item?.precio_unitario ?? item?.precio ?? item?.price ?? 0) || 0;
                const total = Number(item?.total ?? (qty * price)) || 0;
                const alt   = i % 2 === 1;
                return (
                  <tr key={i} className="vf-tr">
                    <td style={{ ...s.td('left', alt), ...s.tdCode }} className="vf-td">
                      {item?.codigo ?? item?.id ?? '—'}
                    </td>
                    <td style={s.td('left', alt)} className="vf-td">
                      <span style={s.itemNombre}>{item?.nombre ?? item?.producto_nombre ?? 'Producto'}</span>
                      {(item?.descripcion || item?.detalle) && (
                        <span style={s.itemDesc}>{item?.descripcion ?? item?.detalle}</span>
                      )}
                    </td>
                    <td style={{ ...s.td('center', alt), ...s.tdMoney }} className="vf-td">
                      {qty}
                    </td>
                    <td style={{ ...s.td('right', alt), ...s.tdMoney }} className="vf-td">
                      {currency(price)}
                    </td>
                    <td style={{ ...s.td('right', alt), ...s.tdMoneyBold }} className="vf-td">
                      {currency(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>


        <hr style={s.divider(C.border)} />

        <div style={s.totalesSection} className="vf-totales">

          {/* Método de pago + estado */}
          <div style={s.paymentBlock}>
            <span style={s.paymentLabel}>Método de pago</span>
            <span style={s.paymentValue}>{factura.metodo_pago ?? 'Pendiente'}</span>
            <span style={s.estadoBadge(isPending)}>
              <StatusDot isPending={isPending} />
              {(factura.estado_pago || '').replace(/_/g, ' ') || 'Sin estado'}
            </span>
          </div>

          {/* Tabla de totales */}
          <div style={s.totalesTable} className="vf-tbl-tbl">
            <div style={{ ...s.totalesRow(false), borderTop: 'none' }}>
              <span style={s.totalesLabel(false)}>Subtotal</span>
              <span style={s.totalesValue(false)}>{currency(subtotal)}</span>
            </div>
            <div style={s.totalesRow(false)}>
              <span style={s.totalesLabel(false)}>IVA</span>
              <span style={s.totalesValue(false)}>{currency(iva)}</span>
            </div>
            <div style={s.totalesRow(true)}>
              <span style={s.totalesLabel(true)}>Total a pagar</span>
              <span style={s.totalesValue(true)}>{currency(total)}</span>
            </div>
          </div>
        </div>

        
        <footer style={s.footer}>
          <p style={s.footerText}>Documento generado por el sistema administrativo
            <p style={s.hp}>Happy Pets.</p>
          </p>
          <p style={s.footerText}>Gracias por su visita.</p>
        </footer>

      </div>
    </div>
  );
};

export default VistaFactura;