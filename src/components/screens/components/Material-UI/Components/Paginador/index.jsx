import React from 'react';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function Paginador({ 
  count = 10, 
  page = 1, 
  onChange, 
  color = 'primary', 
  size = 'medium',
  disabled = false,
  variant = 'outlined',
  shape = 'rounded',
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
  ...props 
}) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: pageSize && onPageSizeChange ? 'space-between' : 'flex-end', 
        width: '100%', 
        mt: 3, 
        mb: 1 
      }}
    >
      {/* ado Izquierdo: Select de Filas */}
      {pageSize && onPageSizeChange ? (
        <FormControl size="small" variant="outlined" sx={{ minWidth: 85 }}>
          <InputLabel id="page-size-select-label">Filas</InputLabel>
          <Select
            labelId="page-size-select-label"
            id="page-size-select"
            value={pageSize}
            label="Filas"
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={disabled} 
            MenuProps={{
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
            }}
          >
            {pageSizeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : <div />}

      {/* Lado Derecho: Controles de Paginación */}
      <Pagination 
        count={count} 
        page={page} 
        onChange={onChange} 
        color={color} 
        size={size}
        disabled={disabled}
        variant={variant}
        shape={shape}
        {...props} 
      />
    </Box>
  );
}
