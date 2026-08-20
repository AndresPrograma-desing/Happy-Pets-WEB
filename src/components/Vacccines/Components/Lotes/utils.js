import { useState, useCallback } from 'react';
import api from '../../../../services/api';
import { VACCINE_BATCHES_TEXT } from './constants';

const EMPTY_BATCH_FORM = {
  laboratory: '',
  batch_number: '',
  expiration_date: '',
  quantity_in_stock: '',
  received_date: ''
};

export function useVaccineBatchesPageLogic() {
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  const [selectedVaccineId, setSelectedVaccineId] = useState('');

  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchError, setBatchError] = useState(null);

  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchForm, setBatchForm] = useState(EMPTY_BATCH_FORM);
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [batchAlert, setBatchAlert] = useState({ open: false, title: '', message: '' });
  const [successAlert, setSuccessAlert] = useState({ open: false, message: '' });

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

  const fetchBatches = useCallback(async () => {
    if (!selectedVaccineId) {
      setBatches([]);
      return;
    }
    setLoadingBatches(true);
    setBatchError(null);
    try {
      const res = await api.getVaccineBatches(selectedVaccineId, { pageSize: 100 });
      const list = Array.isArray(res) ? res : (res?.items || []);
      setBatches(list);
    } catch (err) {
      setBatchError(err?.message || 'Error al obtener los lotes.');
    } finally {
      setLoadingBatches(false);
    }
  }, [selectedVaccineId]);

  const handleVaccineSelect = useCallback((vaccineId) => {
    setSelectedVaccineId(vaccineId);
  }, []);

  const handleBatchFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setBatchForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const openBatchForm = useCallback(() => {
    setBatchForm(EMPTY_BATCH_FORM);
    setShowBatchForm(true);
  }, []);

  const closeBatchForm = useCallback(() => {
    setShowBatchForm(false);
    setBatchForm(EMPTY_BATCH_FORM);
  }, []);

  const handleCreateBatch = useCallback(async () => {
    if (!batchForm.laboratory.trim() || !batchForm.batch_number.trim() || !batchForm.expiration_date || !batchForm.received_date) {
      setBatchAlert({ open: true, title: 'Atención', message: VACCINE_BATCHES_TEXT.requiredAlert });
      return;
    }

    setCreatingBatch(true);
    try {
      const payload = {
        laboratory: batchForm.laboratory.trim(),
        batch_number: batchForm.batch_number.trim(),
        expiration_date: batchForm.expiration_date,
        quantity_in_stock: batchForm.quantity_in_stock ? Number(batchForm.quantity_in_stock) : 0,
        received_date: batchForm.received_date
      };
      await api.createVaccineBatch(selectedVaccineId, payload);
      const batchNumber = payload.batch_number;
      closeBatchForm();
      setSuccessAlert({ open: true, message: VACCINE_BATCHES_TEXT.successMessage(batchNumber) });
      fetchBatches();
    } catch (err) {
      setBatchAlert({ open: true, title: 'Error', message: err?.message || VACCINE_BATCHES_TEXT.genericError });
    } finally {
      setCreatingBatch(false);
    }
  }, [batchForm, selectedVaccineId, closeBatchForm, fetchBatches]);

  return {
    vaccines,
    loadingVaccines,
    loadVaccines,
    selectedVaccineId,
    handleVaccineSelect,
    batches,
    loadingBatches,
    batchError,
    fetchBatches,
    showBatchForm,
    openBatchForm,
    closeBatchForm,
    batchForm,
    handleBatchFormChange,
    handleCreateBatch,
    creatingBatch,
    batchAlert,
    setBatchAlert,
    successAlert,
    setSuccessAlert
  };
}
