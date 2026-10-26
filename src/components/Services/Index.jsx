import React, { useEffect, useCallback, useState } from 'react';
import { TableA, Barnner, DrawPanel } from 'anteriority-ui';
import { PlusCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Popover from '@mui/material/Popover';
import usePanelHeader from '../GenericPanel/usePanelHeader';
import Button from '../screens/components/Button';
import Filter from '../screens/components/Filter/Index';
import TextField from '../screens/components/Material-UI/Components/TextField/Index';
import Selector from '../screens/components/Material-UI/Components/Selector/Index';
import AlertModal from '../AlertModal/AlertModal';
import { useServicesLogic, useServiceCreateLogic } from './utils';
import { SERVICES_TEXT } from './constants';
import styles from './Index.module.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function ServiceFormContent({ form, onChange, onSelectChange }) {
  return (
    <div className={styles.formContent}>
      <TextField
        label={SERVICES_TEXT.formName}
        name="nombre"
        value={form.nombre}
        onChange={onChange}
        placeholder={SERVICES_TEXT.formNamePlaceholder}
        required
      />

      <div className={styles.formRow}>
        <TextField
          label={SERVICES_TEXT.formPrice}
          name="precio"
          type="number"
          value={form.precio}
          onChange={onChange}
          placeholder="0.00"
          required
          inputProps={{ step: '0.01' }}
        />
        <Selector
          label={SERVICES_TEXT.formStatus}
          value={form.activo}
          onChange={(e) => onSelectChange('activo', e.target.value)}
          options={[
            { value: 'true', label: SERVICES_TEXT.activeStatus },
            { value: 'false', label: SERVICES_TEXT.inactiveStatus }
          ]}
        />
      </div>

      <TextField
        label={SERVICES_TEXT.formDescription}
        name="descripcion"
        value={form.descripcion}
        onChange={onChange}
        placeholder={SERVICES_TEXT.formDescriptionPlaceholder}
        multiline
        rows={2}
      />
    </div>
  );
}

export default function Services() {
  const {
    services,
    loading,
    error,
    page,
    setPage,
    pageSize,
    handlePageSizeChange,
    totalPages,
    searchTerm,
    setSearchTerm,
    filterActive,
    setFilterActive,
    handleClearFilters,
    fetchServices
  } = useServicesLogic();

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterActive, setPage]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices, page, pageSize, searchTerm, filterActive]);

  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [successServiceName, setSuccessServiceName] = useState('');
  const [successMode, setSuccessMode] = useState('create');

  const handleCreateSuccess = useCallback((name) => {
    setSuccessServiceName(name);
    setSuccessMode('create');
    setSuccessAlertOpen(true);
    fetchServices();
  }, [fetchServices]);

  const handleUpdateSuccess = useCallback((name) => {
    setSuccessServiceName(name);
    setSuccessMode('update');
    setSuccessAlertOpen(true);
    fetchServices();
  }, [fetchServices]);

  const {
    form,
    showForm,
    setShowForm,
    closeForm,
    alertOpen,
    setAlertOpen,
    alertConfig,
    handleChange,
    handleSelectChange,
    handleCreateSubmit,
    editingService,
    startEdit,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    confirmDelete
  } = useServiceCreateLogic({
    fetchServices,
    onSuccess: handleCreateSuccess,
    onUpdated: handleUpdateSuccess
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeService, setActiveService] = useState(null);

  const handleOpenMenu = (event, service) => {
    setAnchorEl(event.currentTarget);
    setActiveService(service);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleEditClick = () => {
    startEdit(activeService);
    handleCloseMenu();
  };

  const handleDeleteClick = () => {
    setDeleteTarget(activeService);
    handleCloseMenu();
  };

  const activeFiltersCount = [searchTerm, filterActive].filter(Boolean).length;

  usePanelHeader({
    title: SERVICES_TEXT.manageTitle,
    menuTitle: SERVICES_TEXT.menuTitle,
    showPagination: true,
    paginationCount: totalPages,
    paginationPage: page,
    onPaginationChange: (e, p) => setPage(p),
    pageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    onPageSizeChange: handlePageSizeChange
  });

  const columns = [
    {
      header: SERVICES_TEXT.nameCol,
      accessor: 'nombre'
    },
    {
      header: SERVICES_TEXT.descriptionCol,
      render: (row) => row.descripcion || '—'
    },
    {
      header: SERVICES_TEXT.priceCol,
      render: (row) => (
        <span className={styles.priceText}>{Number(row.precio || 0).toFixed(2)}</span>
      )
    },
    {
      header: SERVICES_TEXT.statusCol,
      render: (row) => (
        <Barnner type={row.activo ? 'success' : 'danger'}>
          {row.activo ? SERVICES_TEXT.activeStatus : SERVICES_TEXT.inactiveStatus}
        </Barnner>
      )
    },
    {
      header: SERVICES_TEXT.actionsCol,
      align: 'center',
      render: (row) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="ghost"
            circle
            size="small"
            icon={MoreVertical}
            onClick={(e) => handleOpenMenu(e, row)}
          />
        </div>
      )
    }
  ];

  return (
    <div className={styles.content}>
      <div className={styles.topActions}>
        <Button
          onClick={() => setShowForm(true)}
          icon={PlusCircle}
          variant="primary"
          color={Button.COLORS.PURPLE}
          title={SERVICES_TEXT.addServiceBtn}
        >
          {SERVICES_TEXT.addServiceBtn}
        </Button>
      </div>

      <Filter
        onClear={handleClearFilters}
        searchTerm={searchTerm}
        title={SERVICES_TEXT.filterTitle}
        activeFiltersCount={activeFiltersCount}
      >
        <TextField
          label={SERVICES_TEXT.searchLabel}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={SERVICES_TEXT.searchPlaceholder}
        />

        <Selector
          id="services-status-filter"
          label={SERVICES_TEXT.statusLabel}
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          emptyOptionLabel={SERVICES_TEXT.allStatus}
          options={[
            { value: 'true', label: SERVICES_TEXT.activeStatus },
            { value: 'false', label: SERVICES_TEXT.inactiveStatus }
          ]}
        />
      </Filter>

      <div className={styles.tableWrapper}>
        <TableA
          columns={columns}
          data={services}
          loading={loading}
          error={error}
          onRetry={() => fetchServices()}
          emptyMessage={SERVICES_TEXT.emptyMessage}
          keyExtractor={(row) => row.id}
        />
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          style: { padding: '8px', borderRadius: '12px', minWidth: '160px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Button
            variant="ghost"
            icon={Pencil}
            onClick={handleEditClick}
            style={{ justifyContent: 'flex-start', fontWeight: 500 }}
            fullWidth
          >
            {SERVICES_TEXT.editBtn}
          </Button>
          <Button
            variant="ghost"
            color="red"
            icon={Trash2}
            onClick={handleDeleteClick}
            style={{ justifyContent: 'flex-start', fontWeight: 500 }}
            fullWidth
          >
            {SERVICES_TEXT.deleteBtn}
          </Button>
        </div>
      </Popover>

      <DrawPanel
        isOpen={showForm}
        title={editingService ? SERVICES_TEXT.editDrawPanelTitle : SERVICES_TEXT.drawPanelTitle}
        onClose={closeForm}
        onConfirm={handleCreateSubmit}
        confirmText={editingService ? SERVICES_TEXT.updateBtn : SERVICES_TEXT.confirmBtn}
        cancelText={SERVICES_TEXT.cancelBtn}
        showActions={true}
      >
        <ServiceFormContent
          form={form}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
        />
      </DrawPanel>

      <AlertModal
        open={!!deleteTarget}
        title={SERVICES_TEXT.deleteConfirmTitle}
        message={deleteTarget ? SERVICES_TEXT.deleteConfirmMessage(deleteTarget.nombre) : ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirmText={deleteLoading ? SERVICES_TEXT.deletingLabel : SERVICES_TEXT.deleteBtn}
        cancelText={SERVICES_TEXT.cancelBtn}
      />

      <AlertModal
        open={successAlertOpen}
        title="¡Éxito!"
        message={successMode === 'update' ? SERVICES_TEXT.updateSuccessMessage(successServiceName) : SERVICES_TEXT.successMessage(successServiceName)}
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
