import { useState, useCallback } from 'react';
import api from '../../services/api';
import { getVaccinationCarnetPdf } from '../../services/api/pdf';

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return String(dateStr);
  }
}

export const TRAFFIC_LIGHT_COLORS = {
  Red: { bg: '#fee2e2', text: '#991b1b' },
  Yellow: { bg: '#fffbeb', text: '#92400e' },
  Green: { bg: '#d1fae5', text: '#065f46' },
  default: { bg: '#f1f5f9', text: '#475569' }
};

// El backend a veces envía el nombre ('Red'/'Yellow'/'Green') y a veces el código hex directamente.
const TRAFFIC_LIGHT_HEX_TO_KEY = {
  '#EF4444': 'Red',
  '#EAB308': 'Yellow',
  '#22C55E': 'Green'
};

export function normalizeTrafficLight(trafficLight) {
  const value = String(trafficLight || '').trim();
  if (TRAFFIC_LIGHT_COLORS[value]) return value;
  return TRAFFIC_LIGHT_HEX_TO_KEY[value.toUpperCase()] || value;
}

export function usePetVaccinationLogic(mascotaId) {
  const [status, setStatus] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!mascotaId) {
      setStatus([]);
      setHistory([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [statusRes, historyRes] = await Promise.all([
        api.getPetVaccinationStatus(mascotaId),
        api.getPetVaccinationHistory(mascotaId)
      ]);
      setStatus(statusRes?.items || []);
      setHistory(Array.isArray(historyRes) ? historyRes : (historyRes?.items || []));
    } catch (err) {
      setError(err?.message || 'Error al obtener la información de vacunación.');
    } finally {
      setLoading(false);
    }
  }, [mascotaId]);

  return { status, history, loading, error, fetchData };
}

export function useCarnetDownload(mascotaId) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const download = useCallback(async () => {
    if (!mascotaId) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await getVaccinationCarnetPdf(mascotaId);
      const { blob, filename } = res || {};
      if (!blob) throw new Error('No se pudo obtener el carnet.');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `carnet-vacunacion-${mascotaId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err?.message || 'Error al generar el carnet.');
    } finally {
      setDownloading(false);
    }
  }, [mascotaId]);

  return { download, downloading, downloadError, setDownloadError };
}

export function usePetVaccinationActions(refetch) {
  const [actionModal, setActionModal] = useState({ open: false, mode: null, target: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [resultAlert, setResultAlert] = useState({ open: false, title: '', message: '' });

  const openPostpone = useCallback((row) => {
    setActionModal({ open: true, mode: 'postpone', target: row, reason: '' });
  }, []);

  const openInvoice = useCallback((row) => {
    setActionModal({ open: true, mode: 'invoice', target: row, reason: '' });
  }, []);

  const closeActionModal = useCallback(() => {
    setActionModal({ open: false, mode: null, target: null, reason: '' });
  }, []);

  const setReason = useCallback((value) => {
    setActionModal((prev) => ({ ...prev, reason: value }));
  }, []);

  const confirmAction = useCallback(async () => {
    if (!actionModal.target) return;
    if (actionModal.mode === 'postpone' && !actionModal.reason.trim()) {
      setResultAlert({ open: true, title: 'Atención', message: 'Debe indicar un motivo para posponer.' });
      return;
    }
    setActionLoading(true);
    try {
      if (actionModal.mode === 'postpone') {
        await api.postponePetVaccination(actionModal.target.id, { reason: actionModal.reason.trim() });
      } else if (actionModal.mode === 'invoice') {
        await api.sendPetVaccinationToInvoice(actionModal.target.id);
      }
      closeActionModal();
      if (refetch) refetch();
    } catch (err) {
      setResultAlert({ open: true, title: 'Error', message: err?.message || 'No se pudo completar la acción.' });
    } finally {
      setActionLoading(false);
    }
  }, [actionModal, refetch, closeActionModal]);

  return {
    actionModal,
    openPostpone,
    openInvoice,
    closeActionModal,
    setReason,
    confirmAction,
    actionLoading,
    resultAlert,
    setResultAlert
  };
}

const EMPTY_REGISTER_FORM = {
  vaccine_id: '',
  vaccine_batch_id: '',
  application_date: new Date().toISOString().slice(0, 10),
  weight_at_application: '',
  dose: '',
  next_dose_date_override: '',
  clinical_observations: ''
};

export function useRegisterVaccinationLogic({ mascotaId, onSuccess }) {
  const [form, setForm] = useState(EMPTY_REGISTER_FORM);
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formAlert, setFormAlert] = useState({ open: false, title: '', message: '' });

  const loadVaccines = useCallback(async () => {
    setLoadingVaccines(true);
    try {
      const res = await api.getVaccines({ active: true, pageSize: 100 });
      const list = Array.isArray(res) ? res : (res?.items || []);
      setVaccines(list);
    } catch (err) {
      console.error('Error cargando vacunas:', err);
    } finally {
      setLoadingVaccines(false);
    }
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleVaccineChange = useCallback(async (vaccineId) => {
    setForm((prev) => ({ ...prev, vaccine_id: vaccineId, vaccine_batch_id: '' }));
    setBatches([]);
    if (!vaccineId) return;
    setLoadingBatches(true);
    try {
      const res = await api.getVaccineBatches(vaccineId, { active: true, pageSize: 100 });
      const list = Array.isArray(res) ? res : (res?.items || []);
      setBatches(list.filter((b) => !b.is_expired));
    } catch (err) {
      console.error('Error cargando lotes:', err);
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setForm(EMPTY_REGISTER_FORM);
    setBatches([]);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.vaccine_id || !form.vaccine_batch_id || !form.application_date) {
      setFormAlert({ open: true, title: 'Atención', message: 'Vacuna, Lote y Fecha de Aplicación son obligatorios.' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        mascota_id: Number(mascotaId),
        vaccine_id: Number(form.vaccine_id),
        vaccine_batch_id: Number(form.vaccine_batch_id),
        application_date: form.application_date,
        weight_at_application: form.weight_at_application ? Number(form.weight_at_application) : undefined,
        dose: form.dose.trim() || undefined,
        next_dose_date_override: form.next_dose_date_override || undefined,
        clinical_observations: form.clinical_observations.trim() || undefined
      };
      const created = await api.registerPetVaccination(payload);
      const vaccineName = vaccines.find((v) => String(v.id) === String(form.vaccine_id))?.name || created?.vaccine_name || '';
      resetForm();
      if (onSuccess) onSuccess(vaccineName);
    } catch (err) {
      setFormAlert({ open: true, title: 'Error', message: err?.message || 'No se pudo registrar la dosis.' });
    } finally {
      setSubmitting(false);
    }
  }, [form, mascotaId, vaccines, onSuccess, resetForm]);

  return {
    form,
    handleChange,
    handleVaccineChange,
    vaccines,
    loadingVaccines,
    loadVaccines,
    batches,
    loadingBatches,
    submitting,
    handleSubmit,
    resetForm,
    formAlert,
    setFormAlert
  };
}
