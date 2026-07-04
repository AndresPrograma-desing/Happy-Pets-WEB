import React from 'react';
import styles from './CurrencySelector.module.css';
import { DollarSign, Wallet, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useCurrency } from '../../../../../hooks/moneyType'; 
import { getText } from '../../../../../constants';
import ErrorMessage from '../../../../../components/Notification/Error/ErrorMessage';
import CardV1 from '../../../../../components/screens/components/CardV1';

const CurrencySelector = () => {
  const { 
    currency: currentCurrency, 
    isLoading, 
    isUpdating, 
    changeCurrency, 
    error 
  } = useCurrency();

  const currencies = [
    { code: 'USD', icon: DollarSign, label: getText('moneySettings.dollar') },
    { code: 'VES', icon: Wallet, label: getText('moneySettings.bolivares') }
  ];

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <RefreshCw className={styles.spin} />
        <p>Cargando preferencias...</p>
      </div>
    );
  }

  const selectedData = currencies.find(c => c.code === currentCurrency);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.selectionGrid}>
        {currencies.map((c) => {
          const isActive = currentCurrency === c.code;
          return (
            <div 
              key={c.code}
              onClick={() => !isUpdating && changeCurrency(c.code)} 
              style={{ cursor: isUpdating ? 'default' : 'pointer' }}
            >
              <CardV1
                badgeIcon={c.icon}
                badgeText={c.code}
                badgeBgColor={isActive ? '#dcfce7' : '#f1f5f9'}
                badgeTextColor={isActive ? '#166534' : '#475569'}
                primaryText={c.label}
                secondaryText={isActive ? "Activo" : "Seleccionar"}
                secondaryTextStyle={{
                  color: isActive ? '#16a34a' : '#64748b',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}
                actionIcon={isActive ? Check : (isUpdating && !isActive ? RefreshCw : undefined)}
                isSpinning={isUpdating && !isActive}
                actionDisabled={isUpdating && !isActive}
              />
            </div>
          );
        })}
      </div>

      {/* MENSAJE DE ERROR DINÁMICO */}
      {error && (
        <ErrorMessage 
        message={error} 
        title={getText('moneySettings.atention')} 
      />
      )}

      <div className={styles.infoFooter}>
        <p>
          {getText('moneySettings.moneySelected')}: 
          <strong>{selectedData?.label || 'Sin definir'}</strong>
        </p>
      </div>
    </div>
  );
};

export default CurrencySelector;