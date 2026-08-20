import { useState, useCallback } from 'react';
import api from '../../../../services/api';

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

export function usePendingVaccinationsLogic() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setPage(1);
  }, []);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPendingVaccinationsThisWeek({
        pageNumber: page,
        pageSize,
        searchTerm: searchTerm || undefined
      });
      const list = res?.items || [];
      const totalCount = res?.total_count ?? res?.totalCount ?? list.length;
      setTotalPages(Math.ceil(totalCount / pageSize) || 1);
      setItems(list);
    } catch (err) {
      setError(err?.message || 'Error al obtener las vacunas pendientes.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  return {
    items,
    loading,
    error,
    page,
    setPage,
    pageSize,
    handlePageSizeChange,
    totalPages,
    searchTerm,
    setSearchTerm,
    handleClearFilters,
    fetchPending
  };
}
