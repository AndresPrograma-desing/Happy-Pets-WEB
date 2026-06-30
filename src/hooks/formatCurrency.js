import { useState, useEffect, useCallback } from 'react';
import { getMoneyType, updateMoneyType } from '../services/api';

export const useCurrency = () => {
  const [currency, setCurrency] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrency = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMoneyType();
      // Ajusta según la estructura de tu respuesta (ej: response.data.money_name)
      const activeCurrency = response?.money_name || response?.data?.money_name || 'USD';
      setCurrency(activeCurrency);
    } catch (err) {
      // Captura el mensaje del API o usa uno por defecto
      const msg = err.response?.data?.message || err.message || "Error al obtener moneda";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changeCurrency = async (newCode) => {
    if (newCode === currency) return;
    
    setIsUpdating(true);
    setError(null);
    try {
      await updateMoneyType({ money_name: newCode });
      setCurrency(newCode);
    } catch (err) {
      const msg = err.response?.data?.message || "No se pudo actualizar la moneda";
      setError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, [fetchCurrency]);

  return { currency, isLoading, isUpdating, error, changeCurrency };
};