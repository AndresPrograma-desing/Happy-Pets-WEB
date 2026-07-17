import React from 'react';

export const parseSuggestions = (suggestionsString) => {
  if (!suggestionsString) return [];
  return suggestionsString.split('|').map(s => s.trim()).filter(Boolean);
};

export const formatWeight = (weight) => {
  return weight ? `${weight} kg` : '-';
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

export const getConsultaColumns = () => [
  {
    header: 'Fecha',
    accessor: 'fecha_consulta',
    render: (row) => formatDate(row.fecha_consulta)
  },
  {
    header: 'Síntomas',
    accessor: 'sintomas'
  },
  {
    header: 'Diagnóstico',
    accessor: 'diagnostico'
  },
  {
    header: 'Tratamiento',
    accessor: 'tratamiento'
  },
  {
    header: 'Receta',
    accessor: 'receta'
  },
  {
    header: 'Observaciones',
    accessor: 'observaciones'
  },
  {
    header: 'Doctor',
    accessor: 'doctor_nombre'
  }
];

export const getVacunaColumns = () => [
  {
    header: 'Vacuna',
    accessor: 'nombre_vacuna'
  },
  {
    header: 'Fecha Aplicación',
    accessor: 'fecha_vacunacion',
    render: (row) => formatDate(row.fecha_vacunacion)
  },
  {
    header: 'Próxima Dosis',
    accessor: 'proxima_dosis',
    render: (row) => formatDate(row.proxima_dosis)
  },
  {
    header: 'Lote',
    accessor: 'lote'
  },
  {
    header: 'Doctor',
    accessor: 'doctor_nombre'
  },
  {
    header: 'Notas',
    accessor: 'nota'
  }
];
