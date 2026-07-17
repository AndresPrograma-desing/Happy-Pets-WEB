import React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

export default function Paginador({ 
  count = 10, 
  page = 1, 
  onChange, 
  color = 'primary', 
  size = 'medium',
  disabled = false,
  variant = 'outlined',
  shape = 'rounded',
  spacing = 2,
  ...props 
}) {
  return (
    <Stack spacing={spacing} direction="row" justifyContent="flex-end" sx={{ mt: 3, mb: 1, width: '100%' }}>
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
    </Stack>
  );
}
