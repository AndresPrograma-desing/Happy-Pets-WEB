import React, { useEffect, useCallback } from 'react';
import usePanelHeader from '../../../GenericPanel/usePanelHeader';
import { Activity } from 'lucide-react';
import styles from '../../Index.module.css';
import TableB from '../../../screens/components/TableB';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import Filter from '../../../screens/components/Filter/Index';
import TextField from '../../../screens/components/Material-UI/Components/TextField/Index';
import Selector from '../../../screens/components/Material-UI/Components/Selector/Index';
import { useCurrency } from '../../../../hooks/moneyType';
import { useVaccinesLogic, formatFrequency } from './utils';
import { VACCINES_TEXT } from './constants';

export default function VaccineList() {
  const {
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
  } = useVaccinesLogic();

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterSpecies, filterActive, setPage]);

  useEffect(() => {
    fetchVaccines();
  }, [fetchVaccines, page, pageSize, searchTerm, filterSpecies, filterActive]);

  const { currency, convertAmount, isLoading: currencyLoading } = useCurrency();
  const esUSD = currency?.toUpperCase() === 'USD';

  const formatCurrency = useCallback((v) => {
    const n = Number(v || 0);
    try {
      return new Intl.NumberFormat(esUSD ? 'en-US' : 'es-VE', {
        style: 'currency',
        currency: currency || 'VES',
        maximumFractionDigits: 2
      }).format(n);
    } catch (err) {
      return (esUSD ? '$ ' : 'Bs. ') + n.toLocaleString();
    }
  }, [currency, esUSD]);

  const activeFiltersCount = [searchTerm, filterSpecies, filterActive].filter(Boolean).length;

  const columns = [
    {
      label: VACCINES_TEXT.nameCol,
      key: 'name',
      width: '20%'
    },
    {
      label: VACCINES_TEXT.speciesCol,
      key: 'species',
      width: '15%',
      render: (row) => String(row.species || '').toUpperCase()
    },
    {
      label: VACCINES_TEXT.ageCol,
      key: 'minimum_age_weeks',
      width: '15%',
      render: (row) => row.minimum_age_weeks ? `${row.minimum_age_weeks} sem` : '—'
    },
    {
      label: VACCINES_TEXT.frequencyCol,
      key: 'booster_frequency_value',
      width: '20%',
      render: (row) => formatFrequency(row.booster_frequency_value, row.booster_frequency_unit)
    },
    {
      label: VACCINES_TEXT.priceCol,
      key: 'price',
      width: '15%',
      render: (row) => {
        const montoBase = row.price;
        const montoConvertido = convertAmount(montoBase, esUSD ? 'VES' : 'USD');
        const fmtPrice = formatCurrency(montoBase);
        const textoTooltip = esUSD
          ? `Equivalente: ${montoConvertido.toFixed(2)} Bs`
          : `Equivalente: $${montoConvertido.toFixed(2)} USD`;
        return (
          <ModalTooltip text={textoTooltip}>
            <span className={styles.priceText}>{fmtPrice}</span>
          </ModalTooltip>
        );
      }
    },
    {
      label: VACCINES_TEXT.statusCol,
      key: 'active',
      width: '15%',
      type: 'badge',
      badgeClass: (row) => row.active ? styles.activeBadge : styles.inactiveBadge,
      render: (row) => row.active ? VACCINES_TEXT.activeStatus : VACCINES_TEXT.inactiveStatus
    }
  ];

  usePanelHeader({
    title: VACCINES_TEXT.title,
    menuTitle: VACCINES_TEXT.menuTitle,
    showPagination: true,
    paginationCount: totalPages,
    paginationPage: page,
    onPaginationChange: (e, p) => setPage(p),
    pageSize,
    pageSizeOptions: [5, 10, 20, 50],
    onPageSizeChange: handlePageSizeChange
  });

  return (
    <div className={styles.content}>
      <Filter
        onClear={handleClearFilters}
        searchTerm={searchTerm}
        title={VACCINES_TEXT.filterTitle}
        activeFiltersCount={activeFiltersCount}
      >
        <TextField 
          label={VACCINES_TEXT.searchLabel} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder={VACCINES_TEXT.searchPlaceholder}
        />
        
        <Selector
          id="species-select"
          label={VACCINES_TEXT.speciesLabel}
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          emptyOptionLabel={VACCINES_TEXT.allSpecies}
          options={[
            { value: 'canino', label: 'Canino' },
            { value: 'felino', label: 'Felino' },
            { value: 'equino', label: 'Equino' },
            { value: 'bovino', label: 'Bovino' }
          ]}
        />

        <Selector
          id="status-select"
          label={VACCINES_TEXT.statusLabel}
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          emptyOptionLabel={VACCINES_TEXT.allStatus}
          options={[
            { value: 'true', label: VACCINES_TEXT.activeStatus },
            { value: 'false', label: VACCINES_TEXT.inactiveStatus }
          ]}
        />
      </Filter>

      <div className={styles.tableWrapper}>
        <TableB 
          columns={columns}
          data={vaccines}
          loading={loading || currencyLoading}
          error={error}
          onRetry={() => fetchVaccines()}
          emptyIcon={Activity}
          emptyMessage={VACCINES_TEXT.emptyMessage}
          rowKey={(row) => row.id || row.name}
        />
      </div>
    </div>
  );
}
