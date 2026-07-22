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
  required,
  requiredColor = 'red',
  ...props 
}, ref) => {
  const displayLabel = label ? (
    <span>
      {label}
      {required && <span style={{ color: requiredColor, marginLeft: '4px' }}>**</span>}
    </span>
  ) : undefined;

  return (
    <MuiTextField
      label={displayLabel}
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

TextField.displayName = 'TextField';

export default TextField;