import React, { forwardRef } from 'react';
import MuiTextField from '@mui/material/TextField';

const MultilinePlaceholder = forwardRef(({ 
  label, 
  value, 
  onChange, 
  error, 
  helperText,
  rows = 4,
  maxRows,
  variant = "outlined",
  size = "small",
  fullWidth = true,
  placeholder,
  ...props 
}, ref) => {
  return (
    <MuiTextField
      label={label}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || helperText}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      placeholder={placeholder}
      multiline
      rows={rows}
      maxRows={maxRows}
      sx={{ m: 0, '& .MuiInputBase-root': { backgroundColor: '#fff' } }}
      inputRef={ref}
      {...props}
    />
  );
});

export default MultilinePlaceholder;
