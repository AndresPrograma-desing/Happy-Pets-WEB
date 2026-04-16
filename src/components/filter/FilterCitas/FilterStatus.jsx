// Funciones utilitarias para filtrar citas por estado
export function filterCitasByEstado(citas = [], estado = 'todos') {
  if (!Array.isArray(citas)) return [];
  const target = String(estado || '').toLowerCase().trim();
  if (!target || target === 'todos') return citas;

  return citas.filter((c) => {
    const s = String(c?.estado || '').toLowerCase().trim();
    return s === target;
  });
}

// Opcional: exportar opciones comunes para selects
export const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'programada', label: 'Programada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'completada', label: 'Completada' },
  { value: 'no_asistida', label: 'No asistida' },
  { value: 'cancelada', label: 'Cancelada' },
];

import React from 'react';

export function FilterStatus({ value = 'todos', onChange }) {
  return (
    <select value={value} onChange={(e) => onChange && onChange(e.target.value)}>
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export default filterCitasByEstado;
