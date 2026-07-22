import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ChevronRight } from 'lucide-react';
import Button from '../../../Button';

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
      <Button
        id={`menu-button-${item.label}`}
        variant={Button.VARIANTS.GHOST}
        color="inherit"
        className={styles.navItem}
        aria-controls={open ? `menu-${item.label}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        style={{ justifyContent: 'flex-start', textTransform: 'none' }}
      >
        {renderIcon(item.icon, styles.icon)}
        <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={16} />
        </span>
      </Button>

      <Menu
        id={`menu-${item.label}`}
        aria-labelledby={`menu-button-${item.label}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            style: {
              backgroundColor: '#ffffffff',
              color: '#000000ff',
              borderRadius: '8px',
              marginTop: '4px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              minWidth: '200px',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }
          }
        }}
      >
        {item.subItems && item.subItems.map((subIt) => {
          const isDanger = subIt.isDanger || subIt.label?.toLowerCase().includes('eliminar') || subIt.label?.toLowerCase().includes('cancelar');
          return (
            <MenuItem
              key={subIt.label}
              onClick={() => handleItemClick(subIt)}
              sx={{
                fontSize: '0.9rem',
                py: 1.25,
                px: 2,
                color: isDanger ? '#ef4444 !important' : '#000000ff',
                fontWeight: isDanger ? 500 : 400,
                '&:hover': {
                  backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.08)' : '#b3b3b44b'
                }
              }}
            >
              {subIt.label}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}
