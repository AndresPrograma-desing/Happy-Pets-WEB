import React from 'react';
import styles from './index.module.css';
import { useScrollbar } from './utils';

export default function ScrollBar({
  children,
  vertical = true,
  horizontal = true,
  autoHide = true,
  maxHeight,
  className = '',
  contentClassName = '',
  style
}) {
  const { scrollRef, thumb, visible, handleScroll, handleMouseEnter, handleMouseLeave, startDrag } = useScrollbar({
    vertical,
    horizontal,
    autoHide
  });

  return (
    <div
      className={`${styles.root} ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollRef}
        className={`${styles.scrollArea} ${contentClassName}`}
        style={{
          overflowY: vertical ? 'auto' : 'hidden',
          overflowX: horizontal ? 'auto' : 'hidden',
          maxHeight
        }}
        onScroll={handleScroll}
      >
        {children}
      </div>

      {vertical && thumb.v.size > 0 && (
        <div className={`${styles.trackVertical} ${visible ? styles.trackVisible : ''}`}>
          <div
            className={styles.thumbVertical}
            style={{ height: thumb.v.size, transform: `translateY(${thumb.v.offset}px)` }}
            onMouseDown={(e) => startDrag('v', e)}
          />
        </div>
      )}

      {horizontal && thumb.h.size > 0 && (
        <div className={`${styles.trackHorizontal} ${visible ? styles.trackVisible : ''}`}>
          <div
            className={styles.thumbHorizontal}
            style={{ width: thumb.h.size, transform: `translateX(${thumb.h.offset}px)` }}
            onMouseDown={(e) => startDrag('h', e)}
          />
        </div>
      )}
    </div>
  );
}
