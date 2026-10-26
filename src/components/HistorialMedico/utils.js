import React from 'react';
import { getMedicalHistoryPdf } from '../../services/api/pdf';

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

export const downloadMedicalHistoryPdf = async (mascotaId) => {
  if (!mascotaId) return;
  const res = await getMedicalHistoryPdf(mascotaId);
  const { blob, filename } = res || {};
  if (!blob) throw new Error('No se pudo obtener el historial médico.');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `historial-medico-${mascotaId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
    header: 'Recipe',
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

