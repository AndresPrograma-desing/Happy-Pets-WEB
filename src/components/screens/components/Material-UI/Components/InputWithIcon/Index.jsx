import React from 'react';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import MuiTextField from '@mui/material/TextField';

export default function InputWithIcon({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = 'text',
  variant = 'outlined', // 'standard' | 'outlined' | 'row' | 'filled'
  fullWidth = true,
  ...props
}) {
  const adornmentId = React.useId();

  if (variant === 'standard') {
    return (
      <FormControl variant="standard" fullWidth={fullWidth} sx={{ m: 0 }}>
        {label && <InputLabel htmlFor={adornmentId}>{label}</InputLabel>}
        <Input
          id={adornmentId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          startAdornment={
            Icon && (
              <InputAdornment position="start">
                <Icon size={20} style={{ color: 'black' }} />
              </InputAdornment>
            )
          }
          {...props}
        />
      </FormControl>
    );
  }

  if (variant === 'row') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-end', width: fullWidth ? '100%' : 'auto', gap: 1 }}>
        {Icon && <Icon size={20} style={{ color: 'black', marginBottom: '4px' }} />}
        <MuiTextField
          type={type}
          label={label}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          variant="standard"
          fullWidth={fullWidth}
          {...props}
        />
      </Box>
    );
  }

  // Default: outlined or filled
  return (
    <MuiTextField
      type={type}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant={variant === 'filled' ? 'filled' : 'outlined'}
      size="small"
      fullWidth={fullWidth}
      slotProps={{
        input: {
          startAdornment: Icon && (
            <InputAdornment position="start">
              <Icon size={18} style={{ color: 'currentColor' }} />
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
}
