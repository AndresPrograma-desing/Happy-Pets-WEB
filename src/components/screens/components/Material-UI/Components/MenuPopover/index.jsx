import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ChevronRight } from 'lucide-react';

export default function MenuPopover({ item, styles, renderIcon, onNavigate }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (subItem) => {
    handleClose();
    if (onNavigate) {
      onNavigate(subItem);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <button
        id={`menu-button-${item.label}`}
        className={styles.navItem}
        aria-controls={open ? `menu-${item.label}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        {renderIcon(item.icon, styles.icon)}
        <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={16} />
        </span>
      </button>

      <Menu
        id={`menu-${item.label}`}
        aria-labelledby={`menu-button-${item.label}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            style: {
              backgroundColor: '#2d3748',
              color: '#fff',
              borderRadius: '8px',
              marginLeft: '4px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
              minWidth: '200px'
            }
          }
        }}
      >
        {item.subItems && item.subItems.map((subIt) => (
          <MenuItem
            key={subIt.label}
            onClick={() => handleItemClick(subIt)}
            sx={{
              fontSize: '0.9rem',
              py: 1.5,
              px: 2.5,
              color: '#fff',
              '&:hover': {
                backgroundColor: '#4a5568'
              }
            }}
          >
            {subIt.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
