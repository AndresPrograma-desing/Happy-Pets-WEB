import { useState, useEffect, useCallback } from 'react';
import { getMoneyType, updateMoneyType, getDollarBcv } from '../services/api';
import { getDynamicTexts } from '../constants/index';

export const useCurrency = () => {
  const [currency, setCurrency] = useState('VES'); 
  const [dollarRate, setDollarRate] = useState(0);  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const init = async () => {
      setError(null);
      try {
        const [res, rateRes] = await Promise.all([
          getMoneyType(),
          getDollarBcv().catch((err) => {
            console.error('Error al obtener la tasa BCV:', err);
            return null;
          })
        ]);
         
        const code = res?.Money_type || res?.money_name || 'VES';
        const rate = Number(rateRes?.BcvDollarPrice || rateRes?.data?.BcvDollarPrice || 0);

        setCurrency(code);
        setDollarRate(isNaN(rate) ? 0 : rate);
      } catch (err) {
        setError(err?.message || 'Error al obtener la moneda');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const getCurrencyText = useCallback((path) => {
    const texts = getDynamicTexts(currency);
   
    const keys = path.split('.');
    return keys.reduce((acc, key) => acc && acc[key], texts);
  }, [currency]);
 
  const convertAmount = useCallback((amount, toCurrency) => {
    if (!dollarRate || isNaN(amount)) return 0;
 
    const target = toCurrency
      ? toCurrency.toUpperCase()
      : (currency.toUpperCase() === 'USD' ? 'VES' : 'USD');

    if (target === 'VES') {
      return amount * dollarRate;
    }
     
    return amount / dollarRate;
  }, [dollarRate, currency]);

  const changeCurrency = async (newCode) => {
    setIsUpdating(true);
    setError(null);
    try {
      await updateMoneyType({ money_name: newCode });
      setCurrency(newCode);
    } catch (err) {
      setError(err?.message || 'Error al actualizar la moneda');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    currency,
    dollarRate,       
    convertAmount,    
    isLoading,
    isUpdating,
    changeCurrency,
    getCurrencyText,
    error,
  };
};