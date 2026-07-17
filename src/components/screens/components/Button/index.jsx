import React from 'react';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { VARIANTS, SIZES, COLORS } from './utils';
import styles from './index.module.css';
import ModalTooltip from '../../../ModalTooltip/ModalTooltip';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  active = false,
  fullWidth = false,
  icon: Icon,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  color,
  border,
  borderColor,
  style = {},
  loading = false,
  circle = false,
  ToolTip = false,
  title,
  ...props
}, ref) => {

  // Map custom variant to MUI variant
  let muiVariant = 'contained';
  if (variant === 'outline') muiVariant = 'outlined';
  if (variant === 'ghost' || variant === 'tab' || color === 'transparent') muiVariant = 'text';

  // Map custom size to MUI size
  const muiSize = size === 'large' ? 'large' : size === 'small' ? 'small' : 'medium';

  // Map standard colors to MUI color prop if possible
  let muiColor = 'primary';
  if (variant === 'danger' || color === 'var(--color-danger)' || color === 'var(--cancel-button)' || color === 'red') muiColor = 'error';
  if (variant === 'secondary' || color === 'var(--color-secondary)') muiColor = 'secondary';
  if (color === 'var(--button-green)' || color === 'green') muiColor = 'success';
  if (color === 'transparent') muiColor = 'inherit';
  if (border || borderColor) { muiVariant = 'outlined'; } 
  
  // Check if we need to apply custom color overrides via sx
  const standardMuiColors = ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'];
  const isCustomColor = color && color !== 'transparent' && !standardMuiColors.includes(muiColor) && !standardMuiColors.includes(color);

  // Active state styling
  const activeStyle = active ? { backgroundColor: 'rgba(0, 0, 0, 0.08)' } : {};

  // Circle styling
  const circleStyle = circle ? { 
    borderRadius: '50%', 
    minWidth: 0, 
    padding: size === 'small' ? '6px' : (size === 'large' ? '12px' : '8px') 
  } : {};

  // Custom colors processing
  const customColors = {};
  if (isCustomColor) {
      if (muiVariant === 'contained') {
          customColors.backgroundColor = color;
          customColors.color = '#fff';
          customColors['&:hover'] = { backgroundColor: color, filter: 'brightness(0.9)' };
      } else if (muiVariant === 'outlined') {
          customColors.borderColor = color;
          customColors.color = color;
          customColors['&:hover'] = { borderColor: color, backgroundColor: 'rgba(0, 0, 0, 0.04)' };
      } else {
          customColors.color = color;
          customColors['&:hover'] = { backgroundColor: 'rgba(0, 0, 0, 0.04)' };
      }
  }

  // Handle explicit border and borderColor
  if (border || borderColor) {
      const bColor = borderColor || 'black';
      customColors.border = `1px solid ${bColor} !important`;
      if (!isCustomColor) {
        customColors.borderColor = `${bColor} !important`;
        customColors.color = `${bColor} !important`;
      }
  }

  // Handle icon size
  const iconSize = size === 'small' ? 16 : size === 'large' ? 22 : 18;

  const buttonElement = (
    <MuiButton
      ref={ref}
      type={type}
      variant={muiVariant}
      size={muiSize}
      color={isCustomColor ? undefined : (standardMuiColors.includes(color) ? color : muiColor)}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
      startIcon={!circle && Icon ? <span className={loading ? styles.spinning : ''} style={{ display: 'inline-flex' }}><Icon size={iconSize} /></span> : (!circle && loading ? <CircularProgress size={iconSize} color="inherit" /> : undefined)}
      sx={{
        textTransform: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        boxShadow: (variant === 'primary' && color !== 'transparent' && !disabled) ? '0 4px 6px -1px rgba(14, 165, 233, 0.2)' : 'none',
        ...circleStyle,
        ...activeStyle,
        ...customColors,
        ...style
      }}
      {...props}
    >
      {/* If it's a circle button with an icon, we render the icon inside as children, without startIcon spacing */}
      {circle && Icon ? <span className={loading ? styles.spinning : ''} style={{ display: 'inline-flex' }}><Icon size={iconSize} /></span> : (circle && loading ? <CircularProgress size={iconSize} color="inherit" /> : children)}
    </MuiButton>
  );

  const tooltipText = typeof ToolTip === 'string' ? ToolTip : title;
  if (ToolTip && tooltipText) {
    return <ModalTooltip text={tooltipText}>{buttonElement}</ModalTooltip>;
  }

  return buttonElement;
});

Button.VARIANTS = VARIANTS;
Button.SIZES = SIZES;
Button.COLORS = COLORS;

export { VARIANTS, SIZES, COLORS };
export default Button;
