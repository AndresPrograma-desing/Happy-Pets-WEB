import React from 'react';
import styles from './index.module.css';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';

import Button from '../Button';

/**
 * Reusable CardV1 component
 * 
 * Props:
 * - badgeIcon: Lucide icon component
 * - badgeText: string
 * - badgeBgColor: string (hex or var)
 * - badgeTextColor: string (hex or var)
 * - extraBadges: Array of { text, bgColor, textColor }
 * - actionIcon: Lucide icon component
 * - onActionClick: function
 * - actionDisabled: boolean
 * - actionTooltip: string
 * - isSpinning: boolean (for refresh icons)
 * - actionCustomClass: custom className for action button
 * - isLoading: boolean
 * - isError: boolean
 * - isEmpty: boolean
 * - errorText: string
 * - emptyText: string
 * - primaryText: React node (subtitle/label)
 * - secondaryText: React node (main large value)
 * - secondaryTextStyle: object (inline styles for main value)
 * - footerIcon: Lucide icon component
 * - footerIconColor: string (hex or var)
 * - footerContent: React node (text or elements)
 * - children: React node (custom inner content inserted after secondaryText)
 */
const CardV1 = ({
  badgeIcon: BadgeIcon,
  badgeText,
  badgeBgColor = '#f1f5f9',
  badgeTextColor = '#475569',
  extraBadges = [],
  actionIcon: ActionIcon,
  onActionClick,
  actionDisabled = false,
  actionTooltip,
  isSpinning = false,
  actionCustomClass,
  isLoading = false,
  isError = false,
  isEmpty = false,
  errorText = 'Error',
  emptyText = 'Vacío',
  primaryText,
  secondaryText,
  secondaryTextStyle = {},
  footerIcon: FooterIcon,
  footerIconColor,
  footerContent,
  className = '',
  variant = 'default', // 'default' or 'glass-pink-green'
  children
}) => {
  const cardClassName = `${styles.card} ${variant === 'glass-pink-green' ? 'glass-pink-green' : ''} ${className}`.trim();

  return (
    <div className={cardClassName}>
      {/* TOP SECTION */}
      <div className={styles.topSection}>
        <div className={styles.badgeContainer}>
          {badgeText && (
            <div
              className={styles.badge}
              style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}
            >
              {BadgeIcon && <BadgeIcon size={14} />}
              <span>{badgeText}</span>
            </div>
          )}

          {extraBadges.map((badge, idx) => (
            <div
              key={idx}
              className={styles.badge}
              style={{ backgroundColor: badge.bgColor, color: badge.textColor }}
            >
              <span>{badge.text}</span>
            </div>
          ))}
        </div>

        {ActionIcon && (
          actionTooltip ? (
            <ModalTooltip text={actionTooltip}>
              <Button
                type="button"
                onClick={onActionClick}
                disabled={actionDisabled}
                color={Button.COLORS.TRANSPARENT}
                icon={ActionIcon}
                loading={isSpinning}
                circle
              />
            </ModalTooltip>
          ) : (
            <Button
              type="button"
              onClick={onActionClick}
              disabled={actionDisabled}
              color={Button.COLORS.TRANSPARENT}
              icon={ActionIcon}
              loading={isSpinning}
              circle
            />
          )
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        {isLoading ? (
          <div className={styles.skeleton} />
        ) : isError ? (
          <div className={styles.priceContainer}>
            <span className={`${styles.price} ${styles.errorText}`}>{errorText}</span>
          </div>
        ) : isEmpty ? (
          <div className={styles.priceContainer}>
            <span className={`${styles.price} ${styles.emptyText}`}>{emptyText}</span>
          </div>
        ) : (
          <div className={styles.priceContainer} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            {primaryText && (
              <span className={styles.currencyLabel}>{primaryText}</span>
            )}
            {secondaryText && (
              <div className={styles.messageWrapper}>
                <span className={styles.price} style={secondaryTextStyle}>
                  {secondaryText}
                </span>
              </div>
            )}
            {children}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {footerContent && (
        <div className={styles.footer}>
          {FooterIcon && (
            <FooterIcon
              size={12}
              className={styles.trend}
              style={footerIconColor ? { color: footerIconColor } : {}}
            />
          )}
          {footerContent}
        </div>
      )}

      <hr style={{ border: '0', borderTop: '1px solid #131414', margin: '1.5rem 0' }} />
    </div>
  );
};

export default CardV1;
