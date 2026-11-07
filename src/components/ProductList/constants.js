export const PRODUCT_LIST_TEXTS = {
  statusColumn: 'ESTADO',
  statusActive: 'Activo',
  statusDisabled: 'Deshabilitado'
};

export const PRODUCT_LIST_CONFIG = {
  showEditAction: false
};

export const STATUS_BADGE_COLORS = {
  active: { bgColor: '#dcfce7', borderColor: '#bbf7d0', valueColor: '#166534', iconColor: '#166534' },
  disabled: { bgColor: '#e2e8f0', borderColor: '#cbd5e1', valueColor: '#475569', iconColor: '#475569' }
};

export const PRODUCT_STATUS_FILTER = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ALL: 'all'
};

export const PRODUCT_STATUS_FILTER_LABEL = 'Estado';

export const PRODUCT_STATUS_OPTIONS = [
  { value: PRODUCT_STATUS_FILTER.ACTIVE, label: 'Activos' },
  { value: PRODUCT_STATUS_FILTER.DISABLED, label: 'Deshabilitados' },
  { value: PRODUCT_STATUS_FILTER.ALL, label: 'Todos' }
];
