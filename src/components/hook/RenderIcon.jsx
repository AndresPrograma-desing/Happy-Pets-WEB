import React from 'react';
import { getIcon } from '../../assets/icons/ExportIcon/Index'; 

export const renderIcon = (icon, classNameStyles = '') => {
  if (!icon) return null;

  if (typeof icon === 'string') {
    return <img src={getIcon(icon)} alt="" className={classNameStyles} />;
  }

  const iconColor = icon.props.color || '#ffffff';

  return React.cloneElement(icon, {
    className: `${icon.props.className || ''} ${classNameStyles}`.trim(),
    size: icon.props.size || 14,
    color: iconColor,
    style: { 
      filter: 'none',
      color: iconColor,
      stroke: iconColor, 
      ...icon.props.style 
    }
  });
};