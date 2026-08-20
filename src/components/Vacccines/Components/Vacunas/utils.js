import { useState, useCallback } from 'react';
import api from '../../../../services/api';

export function useVaccinesLogic() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterSpecies('');
    setFilterActive('');
    setPage(1);
  }, []);

  const fetchVaccines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeParam = filterActive === 'true' ? true : (filterActive === 'false' ? false : undefined);
      const res = await api.getVaccines({
        pageNumber: page,
        pageSize: pageSize,
        searchTerm: searchTerm || undefined,
        species: filterSpecies || undefined,
        active: activeParam
      });

      const list = Array.isArray(res)
        ? res
        : (res?.items || res?.vaccines || res?.data || []);

      const totalCount = res?.total_count ?? res?.totalCount;
      if (res?.totalPages) {
        setTotalPages(res.totalPages);
      } else if (res?.totalPagesCount) {
        setTotalPages(res.totalPagesCount);
      } else if (totalCount !== undefined) {
        setTotalPages(Math.ceil(totalCount / pageSize) || 1);
      } else {
        setTotalPages(list.length < pageSize && page === 1 ? 1 : page + (list.length === pageSize ? 1 : 0));
      }

      setVaccines(list);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Error al obtener vacunas');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, filterSpecies, filterActive]);

  return {
    vaccines,
    loading,
    error,
    page,
    setPage,
    pageSize,
    handlePageSizeChange,
    totalPages,
    searchTerm,
    setSearchTerm,
    filterSpecies,
    setFilterSpecies,
    filterActive,
    setFilterActive,
    handleClearFilters,
    fetchVaccines
  };
}

export function formatFrequency(value, unit) {
  if (!value) return '—';
  const displayUnit = String(unit || '').toLowerCase();
  if (displayUnit.includes('year')) {
    return `${value} ${value === 1 ? 'Año' : 'Años'}`;
  }
  if (displayUnit.includes('month')) {
    return `${value} ${value === 1 ? 'Mes' : 'Meses'}`;
  }
  if (displayUnit.includes('week')) {
    return `${value} ${value === 1 ? 'Semana' : 'Semanas'}`;
  }
  return `${value} ${unit}`;
}

const EMPTY_VACCINE_FORM = {
  name: '',
  species: '',
  minimum_age_weeks: '',
  booster_frequency_value: '',
  booster_frequency_unit: 'Semanas',
  description: '',
  price: '',
  producto_id: '',
  active: 'true'
};

export function useVaccineCreateLogic({ fetchVaccines, onSuccess, onUpdated }) {
  const [showForm, setShowForm] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [form, setForm] = useState(EMPTY_VACCINE_FORM);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await api.getProducts({ pageSize: 100 });
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res?.products) list = res.products;
      else if (res?.data) list = res.data;
      else if (res?.items) list = res.items;
      setProducts(list);
    } catch (err) {
      console.error('Error fetching products for vaccines:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(EMPTY_VACCINE_FORM);
    setEditingVaccine(null);
  }, []);

  const startEdit = useCallback((vaccine) => {
    setEditingVaccine(vaccine);
    setForm({
      name: vaccine.name || '',
      species: vaccine.species || '',
      minimum_age_weeks: vaccine.minimum_age_weeks ?? '',
      booster_frequency_value: vaccine.booster_frequency_value ?? '',
      booster_frequency_unit: vaccine.booster_frequency_unit || 'Semanas',
      description: vaccine.description || '',
      price: vaccine.price ?? '',
      producto_id: vaccine.producto_id ? String(vaccine.producto_id) : '',
      active: vaccine.active ? 'true' : 'false'
    });
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    resetForm();
  }, [resetForm]);

  const handleCreateSubmit = useCallback(async () => {
    if (!form.name.trim() || !form.species || !form.price) {
      setAlertConfig({
        title: 'Atención',
        message: 'Nombre, Especie y Precio son obligatorios.'
      });
      setAlertOpen(true);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        species: form.species,
        minimum_age_weeks: form.minimum_age_weeks ? Number(form.minimum_age_weeks) : 0,
        booster_frequency_value: form.booster_frequency_value ? Number(form.booster_frequency_value) : 0,
        booster_frequency_unit: form.booster_frequency_unit,
        description: form.description.trim() || '',
        price: Number(form.price) || 0,
        producto_id: form.producto_id ? Number(form.producto_id) : 0,
        active: form.active === 'true'
      };

      const vaccineName = form.name;

      if (editingVaccine) {
        await api.updateVaccine(editingVaccine.id, payload);
        closeForm();
        if (fetchVaccines) fetchVaccines();
        if (onUpdated) onUpdated(vaccineName);
      } else {
        await api.createVaccine(payload);
        closeForm();
        if (fetchVaccines) fetchVaccines();
        if (onSuccess) onSuccess(vaccineName);
      }
    } catch (err) {
      const errMsg = err?.message || 'Hubo un error en la solicitud';
      setAlertConfig({
        title: 'Error',
        message: errMsg
      });
      setAlertOpen(true);
    }
  }, [form, fetchVaccines, onSuccess, onUpdated, editingVaccine, closeForm]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.deleteVaccine(deleteTarget.id);
      setDeleteTarget(null);
      if (fetchVaccines) fetchVaccines();
    } catch (err) {
      setDeleteTarget(null);
      setAlertConfig({
        title: 'Error',
        message: err?.message || 'No se pudo eliminar la vacuna.'
      });
      setAlertOpen(true);
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteTarget, fetchVaccines]);

  return {
    form,
    showForm,
    setShowForm,
    closeForm,
    alertOpen,
    setAlertOpen,
    alertConfig,
    setAlertConfig,
    products,
    loadingProducts,
    loadProducts,
    handleChange,
    handleSelectChange,
    handleCreateSubmit,
    resetForm,
    editingVaccine,
    startEdit,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    confirmDelete
  };
}
