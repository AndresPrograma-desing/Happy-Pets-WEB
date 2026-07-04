import React, { forwardRef } from 'react';
import MuiTextField from '@mui/material/TextField';

const TextField = forwardRef(({ 
  label, 
  value, 
  onChange, 
  error, 
  helperText,
  type = "text",
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
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      placeholder={placeholder}
      sx={{ m: 0, '& .MuiInputBase-root': { backgroundColor: '#fff' } }}
      inputRef={ref}
      {...props}
    />
  );
});

export default TextField;
