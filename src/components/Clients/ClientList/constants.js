export const REPORT_TEXT = {
  download: 'Reporte',
  generating: 'Generando...',
  tooltip: 'Descargar reporte completo del cliente y la mascota',
  menuLabel: (petName) => `Descargar Reporte (${petName})`,
  error: 'No se pudo descargar el reporte completo.',
  fileFallback: (id) => `reporte-completo-${id}.pdf`
};
