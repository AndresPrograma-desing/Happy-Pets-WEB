import React from 'react';
import { Receipt, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '../../../../hooks/moneyType';
import CardV1 from '../../../screens/components/CardV1';

const BillingStatusCard = () => {
  const { currency, isLoading, error } = useCurrency();

  return (
    <CardV1
      badgeIcon={Receipt}
      badgeText="Sistema"
      badgeBgColor="#eff6ff"
      badgeTextColor="#3b82f6"
      isLoading={isLoading && !currency}
      isError={!!error}
      errorText={error || "Error"}
      secondaryText={currency === 'USD' ? 'Dólares (USD)' : 'Bolívares (VES)'}
      secondaryTextStyle={{ fontSize: '1.1rem', textTransform: 'uppercase' }}
      footerIcon={CheckCircle2}
      footerIconColor={currency === 'USD' ? "#22c55e" : "#0369a1"}
      footerContent={<span style={{ marginLeft: '4px' }}>Facturando en {currency || '...'}</span>}
    />
  );
};

export default BillingStatusCard;