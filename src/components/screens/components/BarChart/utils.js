import { STAGGER_DELAY_MS, MAX_STAGGER_DELAY_MS } from './constants';

export const getMaxValue = (data) =>
  data.reduce((max, item) => Math.max(max, item.value || 0), 0);

export const getHeightPercent = (value, maxValue) =>
  maxValue > 0 ? ((value || 0) / maxValue) * 100 : 0;

export const getStaggerDelay = (index, step = STAGGER_DELAY_MS, cap = MAX_STAGGER_DELAY_MS) =>
  Math.min(index * step, cap);
