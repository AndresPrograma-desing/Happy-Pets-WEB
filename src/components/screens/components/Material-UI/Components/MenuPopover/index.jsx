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
              backgroundColor: '#ffffffff',
              color: '#000000ff',
              borderRadius: '3px',
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
              color: '#000000ff',
              '&:hover': {
                backgroundColor: '#b3b3b44b'
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
