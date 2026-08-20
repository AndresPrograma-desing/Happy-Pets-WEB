import React, { useEffect, useCallback, useMemo, useState } from 'react';
import usePanelHeader from '../../../GenericPanel/usePanelHeader';
import { Activity, PlusCircle } from 'lucide-react';
import styles from '../../Index.module.css';
import TableB from '../../../screens/components/TableB';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import Filter from '../../../screens/components/Filter/Index';
import TextField from '../../../screens/components/Material-UI/Components/TextField/Index';
import Selector from '../../../screens/components/Material-UI/Components/Selector/Index';
import Button from '../../../screens/components/Button';
import DrawPanel from '../../../screens/components/DrawPanel';
import AlertModal from '../../../AlertModal/AlertModal';
import { getIcon } from '../../../../assets/icons/ExportIcon/Index';
import { useCurrency } from '../../../../hooks/moneyType';
import { useVaccinesLogic, useVaccineCreateLogic, formatFrequency } from './utils';
import { VACCINES_TEXT } from './constants';

function VaccineFormContent({ form, onChange, onSelectChange, productOptions, loadingProducts }) {
  return (
    <div className={styles.formContent}>
      <div className={styles.formRow}>
        <TextField
          label={VACCINES_TEXT.formName}
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder={VACCINES_TEXT.formNamePlaceholder}
          required
        />
        <Selector
          label={VACCINES_TEXT.formSpecies}
          value={form.species}
          onChange={(e) => onSelectChange('species', e.target.value)}
          required
          options={[
            { value: 'canino', label: 'Canino' },
            { value: 'felino', label: 'Felino' },
            { value: 'equino', label: 'Equino' },
            { value: 'bovino', label: 'Bovino' }
          ]}
        />
      </div>

      <div className={styles.formRow}>
        <TextField
          label={VACCINES_TEXT.formMinAge}
          name="minimum_age_weeks"
          type="number"
          value={form.minimum_age_weeks}
          onChange={onChange}
          placeholder="0"
        />
        <TextField
          label={VACCINES_TEXT.formPrice}
          name="price"
          type="number"
          value={form.price}
          onChange={onChange}
          placeholder="0.00"
          required
          inputProps={{ step: "0.01" }}
        />
      </div>

      <div className={styles.formRow}>
        <TextField
          label={VACCINES_TEXT.formBoosterFreqVal}
          name="booster_frequency_value"
          type="number"
          value={form.booster_frequency_value}
          onChange={onChange}
          placeholder="0"
        />
        <Selector
          label={VACCINES_TEXT.formBoosterFreqUnit}
          value={form.booster_frequency_unit}
          onChange={(e) => onSelectChange('booster_frequency_unit', e.target.value)}
          options={[
            { value: 'Semanas', label: 'Semanas' },
            { value: 'Meses', label: 'Meses' },
            { value: 'Años', label: 'Años' }
          ]}
        />
      </div>

      <div className={styles.formRow}>
        <Selector
          label={VACCINES_TEXT.formProduct}
          value={form.producto_id}
          onChange={(e) => onSelectChange('producto_id', e.target.value)}
          placeholder={loadingProducts ? VACCINES_TEXT.loadingProducts : VACCINES_TEXT.selectProductPlaceholder}
          options={productOptions}
        />
        <Selector
          label={VACCINES_TEXT.formStatus}
          value={form.active}
          onChange={(e) => onSelectChange('active', e.target.value)}
          options={[
            { value: 'true', label: VACCINES_TEXT.activeStatus },
            { value: 'false', label: VACCINES_TEXT.inactiveStatus }
          ]}
        />
      </div>

      <TextField
        label={VACCINES_TEXT.formDescription}
        name="description"
        value={form.description}
        onChange={onChange}
        placeholder={VACCINES_TEXT.formDescriptionPlaceholder}
        multiline
        rows={2}
      />
    </div>
  );
}

export default function VaccineCreate({ openCreate }) {
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

  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [successVaccineName, setSuccessVaccineName] = useState('');
  const [successMode, setSuccessMode] = useState('create');

  const handleCreateSuccess = useCallback((createdName) => {
    setSuccessVaccineName(createdName);
    setSuccessMode('create');
    setSuccessAlertOpen(true);
    fetchVaccines();
  }, [fetchVaccines]);

  const handleUpdateSuccess = useCallback((updatedName) => {
    setSuccessVaccineName(updatedName);
    setSuccessMode('update');
    setSuccessAlertOpen(true);
    fetchVaccines();
  }, [fetchVaccines]);

  const {
    form,
    showForm,
    setShowForm,
    closeForm,
    alertOpen,
    setAlertOpen,
    alertConfig,
    products,
    loadingProducts,
    loadProducts,
    handleChange,
    handleSelectChange,
    handleCreateSubmit,
    editingVaccine,
    startEdit,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    confirmDelete
  } = useVaccineCreateLogic({
    fetchVaccines,
    onSuccess: handleCreateSuccess,
    onUpdated: handleUpdateSuccess
  });

  useEffect(() => {
    if (showForm) {
      loadProducts();
    }
  }, [showForm, loadProducts]);

  useEffect(() => {
    if (openCreate) {
      setShowForm(true);
    }
  }, [openCreate, setShowForm]);

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

  const productOptions = useMemo(() => {
    return products.map((prod) => {
      const id = prod.id;
      const name = prod.nombre || prod.name || `Producto ${id}`;
      return { value: String(id), label: name };
    });
  }, [products]);

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
    },
    {
      label: VACCINES_TEXT.actionsCol,
      key: 'actions',
      type: 'actions',
      align: 'center',
      width: '25%',
      actions: [
        {
          label: VACCINES_TEXT.editBtn,
          onClick: (row) => startEdit(row)
        },
        {
          label: VACCINES_TEXT.deleteBtn,
          icon: getIcon('trash') || undefined,
          onClick: (row) => setDeleteTarget(row)
        }
      ]
    }
  ];

  usePanelHeader({
    title: VACCINES_TEXT.manageTitle,
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
      <div className={styles.topActions}>
        <Button
          onClick={() => setShowForm(true)}
          icon={PlusCircle}
          variant="primary"
          color={Button.COLORS.PURPLE}
          title={VACCINES_TEXT.addVaccineBtn}
        >
          {VACCINES_TEXT.addVaccineBtn}
        </Button>
      </div>

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
          id="species-select-manage"
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
          id="status-select-manage"
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

      <DrawPanel
        isOpen={showForm}
        title={editingVaccine ? VACCINES_TEXT.editDrawPanelTitle : VACCINES_TEXT.drawPanelTitle}
        onClose={closeForm}
        onConfirm={handleCreateSubmit}
        confirmText={editingVaccine ? VACCINES_TEXT.updateBtn : VACCINES_TEXT.confirmBtn}
        cancelText={VACCINES_TEXT.cancelBtn}
        showActions={true}
        showCountdown={true}
        formData={form}
        requiredFields={['name', 'species', 'price']}
      >
        <VaccineFormContent
          form={form}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          productOptions={productOptions}
          loadingProducts={loadingProducts}
        />
      </DrawPanel>

      <AlertModal
        open={!!deleteTarget}
        title={VACCINES_TEXT.deleteConfirmTitle}
        message={deleteTarget ? VACCINES_TEXT.deleteConfirmMessage(deleteTarget.name) : ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirmText={deleteLoading ? VACCINES_TEXT.deletingLabel : VACCINES_TEXT.deleteBtn}
        cancelText={VACCINES_TEXT.cancelBtn}
      />

      <AlertModal
        open={successAlertOpen}
        title="¡Éxito!"
        message={successMode === 'update' ? VACCINES_TEXT.updateSuccessMessage(successVaccineName) : VACCINES_TEXT.successMessage(successVaccineName)}
        onClose={() => setSuccessAlertOpen(false)}
        confirmText="Entendido"
      />

      <AlertModal
        open={alertOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertOpen(false)}
        confirmText="Entendido"
      />
    </div>
  );
}
