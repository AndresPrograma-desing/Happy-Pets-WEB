import React from 'react';
import styles from './CurrencySelector.module.css';
import { DollarSign, Wallet } from 'lucide-react';
import { useCurrency } from '../../../../../hooks/moneyType';
import { getText } from '../../../../../constants';
import { Loading, PlaceholderButton, Checks } from 'anteriority-ui';
import ErrorMessage from '../../../../../components/Notification/Error/ErrorMessage';
import { updateBcvPrice } from '../../../../../services/api';
import { useBcvSettings } from '../BcvConfig/utils';
import { BCV_CONFIG_TEXT } from '../../../../../constants/TEXT';

const CurrencySelector = () => {
  const { 
    currency: currentCurrency, 
    isLoading: currencyLoading, 
    isUpdating, 
    changeCurrency, 
    error 
  } = useCurrency();

  const { price: bcvPrice, loading: bcvLoading, clearCache: bcvClearCache } = useBcvSettings();

  const isGlobalLoading = currencyLoading || bcvLoading;

  const currencies = [
    { code: 'USD', icon: DollarSign, label: getText('moneySettings.dollar') },
    { code: 'VES', icon: Wallet, label: getText('moneySettings.bolivares') }
  ];

  if (isGlobalLoading) {
    return (
      <div className={styles.mainContainer}>
         <Loading size="large" />
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
            <Checks
              key={c.code}
              label={`${c.label} (${c.code})`}
              checked={isActive}
              disabled={isUpdating}
              onChange={() => !isActive && changeCurrency(c.code)}
              checkedBgColor="#dcfce7"
            />
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

      <hr style={{ border: '0', borderTop: '1px solid #131414', margin: '1.5rem 0' }} />
      
      <PlaceholderButton
          icon={DollarSign}
          tooltipText={BCV_CONFIG_TEXT.bcvPricePlaceholder}
          placeholder={BCV_CONFIG_TEXT.placeholderHint}
          unitText={BCV_CONFIG_TEXT.unitText}
          buttonText={BCV_CONFIG_TEXT.buttonText}
          hintText={BCV_CONFIG_TEXT.hintText}
          initialValue={bcvPrice}
          onSavePromise={updateBcvPrice}
          clearCache={bcvClearCache}
          successMessage={BCV_CONFIG_TEXT.successMessage}
          errorMessage={BCV_CONFIG_TEXT.errorMessage}
          validationErrorMsg={BCV_CONFIG_TEXT.validationErrorMsg}
      />
    </div>
  );
};

export default CurrencySelector;