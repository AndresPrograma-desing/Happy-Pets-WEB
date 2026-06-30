import React from 'react';
import styles from './CurrencySelector.module.css';
import { DollarSign, Wallet, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useCurrency } from '../../../../../hooks/moneyType'; 
import { getText } from '../../../../../constants';
import ErrorMessage from '../../../../../components/Notification/Error/ErrorMessage';
const CurrencySelector = () => {
  const { 
    currency: currentCurrency, 
    isLoading, 
    isUpdating, 
    changeCurrency, 
    error 
  } = useCurrency();

  const currencies = [
    { code: 'USD', icon: <DollarSign size={24} />, label: getText('moneySettings.dollar') },
    { code: 'VES', icon: <Wallet size={24} />, label: getText('moneySettings.bolivares') }
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
              className={`${styles.card} ${isActive ? styles.activeCard : styles.inactiveCard}`}
              onClick={() => !isUpdating && changeCurrency(c.code)} 
            >
              <div className={styles.checkContainer}>
                {isActive ? (
                  <div className={styles.checkedCircle}><Check size={14} /></div>
                ) : (
                  <div className={styles.emptyCircle} />
                )}
              </div>
              <div className={styles.iconBox}>{c.icon}</div>
              <span className={styles.currencyCode}>{c.code}</span>
              
              {/* Indicador de carga individual por card */}
              {isUpdating && !isActive && (
                <div className={styles.cardOverlay}>
                  <RefreshCw className={styles.spin} size={16} />
                </div>
              )}
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