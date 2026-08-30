import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';
import styles from './index.module.css';
import { DEFAULT_HEIGHT } from './constants';
import { getMaxValue, getHeightPercent, getStaggerDelay } from './utils';

/**
 * Reusable animated bar chart.
 *
 * Props:
 * - data: Array<{ label: string, value: number }>
 * - valueFormatter: (value) => string, used for the per-bar tooltip
 * - height: number (px)
 * - highlightIndex: index of the bar to render as active/highlighted
 * - emptyMessage / emptyIcon: shown when there's no meaningful data to plot
 */
const BarChart = (props) => {
  const {
    data = [],
    valueFormatter = (value) => value,
    height = DEFAULT_HEIGHT,
    highlightIndex = -1,
    emptyMessage = 'No hay datos disponibles.',
    emptyIcon: EmptyIcon = BarChart3,
  } = props;

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const maxValue = getMaxValue(data);
  const hasData = data.length > 0 && maxValue > 0;

  return hasData ? (
    <div className={styles.chartArea} style={{ height }}>
      {data.map((item, index) => {
        const isActive = index === highlightIndex;
        const heightPct = animated ? getHeightPercent(item.value, maxValue) : 0;

        return (
          <div key={item.label ?? index} className={styles.column}>
            <div className={styles.barWrap}>
              <ModalTooltip
                text={valueFormatter(item.value)}
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  justifyContent: 'center',
                  transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${getStaggerDelay(index)}ms`,
                }}
              >
                <div className={`${styles.bar} ${isActive ? styles.barActive : ''}`} />
              </ModalTooltip>
            </div>
            <span className={`${styles.label} ${isActive ? styles.labelActive : ''}`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  ) : (
    <div className={styles.emptyState} style={{ height }}>
      <EmptyIcon size={40} className={styles.emptyIcon} />
      <p className={styles.emptyMessage}>{emptyMessage}</p>
    </div>
  );
};

export default BarChart;
