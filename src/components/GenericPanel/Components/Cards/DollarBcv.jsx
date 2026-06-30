import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, DollarSign, ArrowUpRight } from 'lucide-react';
import { fetchDollarRate } from '../../../../hooks/requestDollarBcv';
import CardV1 from '../../../screens/components/CardV1';

const DollarCard = () => {
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const hasFetched = useRef(false);

  const getRate = useCallback(async (isManualRefresh = false) => {
    if (!isManualRefresh && hasFetched.current) return;
    
    setLoading(true);
    hasFetched.current = true;

    try {
      const data = await fetchDollarRate();
      setRate(data);
    } catch (err) {
      console.error("Error fetching dollar rate:", err);
      setRate(0);
      hasFetched.current = false; 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getRate();
  }, [getRate]);

  return (
    <CardV1
      badgeIcon={DollarSign}
      badgeText="BCV"
      badgeBgColor={typeof rate === 'number' ? '#f0fdf4' : '#fef2f2'}
      badgeTextColor={typeof rate === 'number' ? '#16a34a' : '#dc2626'}
      actionIcon={RefreshCw}
      onActionClick={() => getRate(true)}
      actionDisabled={loading}
      actionTooltip="Actualizar tasa"
      isSpinning={loading}
      isLoading={loading && rate === null}
      primaryText={typeof rate === 'number' ? "Bs." : undefined}
      secondaryText={
        typeof rate === 'number'
          ? rate?.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : rate
      }
      secondaryTextStyle={
        typeof rate !== 'number'
          ? {
              fontSize: '1.2rem',
              textAlign: 'center',
              color: '#ff3333',
              fontWeight: '800',
              textShadow: '0 0 8px rgba(255, 51, 51, 0.25)',
            }
          : {}
      }
      footerIcon={ArrowUpRight}
      footerContent={<span>Tasa oficial</span>}
    />
  );
};

export default DollarCard;