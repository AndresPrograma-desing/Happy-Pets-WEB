import { useState, useCallback } from 'react';
import api from '../../services/api';

export function useServicesLogic() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterActive('');
    setPage(1);
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeParam = filterActive === 'true' ? true : (filterActive === 'false' ? false : undefined);
      const res = await api.getServices({
        pageNumber: page,
        pageSize,
        searchTerm: searchTerm || undefined,
        active: activeParam
      });

      const list = Array.isArray(res) ? res : (res?.items || []);
      const totalCount = res?.total_count;
      setTotalPages(totalCount !== undefined ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1);
      setServices(list);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Error al obtener servicios');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, filterActive]);

  return {
    services,
    loading,
    error,
    page,
    setPage,
    pageSize,
    handlePageSizeChange,
    totalPages,
    searchTerm,
    setSearchTerm,
    filterActive,
    setFilterActive,
    handleClearFilters,
    fetchServices
  };
}

const EMPTY_SERVICE_FORM = {
  nombre: '',
  descripcion: '',
  precio: '',
  activo: 'true'
};

export function useServiceCreateLogic({ fetchServices, onSuccess, onUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
  const [editingService, setEditingService] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_SERVICE_FORM);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(EMPTY_SERVICE_FORM);
    setEditingService(null);
  }, []);

  const startEdit = useCallback((service) => {
    setEditingService(service);
    setForm({
      nombre: service.nombre || '',
      descripcion: service.descripcion || '',
      precio: service.precio ?? '',
      activo: service.activo ? 'true' : 'false'
    });
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    resetForm();
  }, [resetForm]);

  const handleCreateSubmit = useCallback(async () => {
    if (!form.nombre.trim() || !form.precio) {
      setAlertConfig({
        title: 'Atención',
        message: 'Nombre y Precio son obligatorios.'
      });
      setAlertOpen(true);
      return;
    }

    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio: Number(form.precio) || 0,
        activo: form.activo === 'true'
      };

      const serviceName = form.nombre;

      if (editingService) {
        await api.updateService(editingService.id, payload);
        closeForm();
        if (fetchServices) fetchServices();
        if (onUpdated) onUpdated(serviceName);
      } else {
        await api.createService(payload);
        closeForm();
        if (fetchServices) fetchServices();
        if (onSuccess) onSuccess(serviceName);
      }
    } catch (err) {
      setAlertConfig({
        title: 'Error',
        message: err?.message || 'Hubo un error en la solicitud'
      });
      setAlertOpen(true);
    }
  }, [form, fetchServices, onSuccess, onUpdated, editingService, closeForm]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.deleteService(deleteTarget.id);
      setDeleteTarget(null);
      if (fetchServices) fetchServices();
    } catch (err) {
      setDeleteTarget(null);
      setAlertConfig({
        title: 'Error',
        message: err?.message || 'No se pudo eliminar el servicio.'
      });
      setAlertOpen(true);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, fetchServices]);

  return {
    form,
    showForm,
    setShowForm,
    closeForm,
    alertOpen,
    setAlertOpen,
    alertConfig,
    handleChange,
    handleSelectChange,
    handleCreateSubmit,
    editingService,
    startEdit,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    confirmDelete
  };
}
