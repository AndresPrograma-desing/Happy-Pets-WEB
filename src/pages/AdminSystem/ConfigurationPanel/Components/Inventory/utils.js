export function getMovementBadgeVariant(tipoMovimiento) {
  const tipo = (tipoMovimiento || '').toLowerCase();
  if (tipo === 'entrada') return 'success';
  if (tipo === 'salida') return 'danger';
  return 'neutral';
}

export function getMovementLabel(tipoMovimiento, texts) {
  const tipo = (tipoMovimiento || '').toLowerCase();
  if (tipo === 'entrada') return texts.typeEntrada;
  if (tipo === 'salida') return texts.typeSalida;
  return tipoMovimiento || '—';
}
