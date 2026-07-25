import React, { forwardRef } from 'react';
import MuiTextField from '@mui/material/TextField';
import { formatHighlightedText } from '../../../GreenHighlight/utils.jsx';

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
  const formattedLabel = typeof label === 'string' ? formatHighlightedText(label) : label;
  const displayHelperText = typeof helperText === 'string' ? formatHighlightedText(helperText) : helperText;

  return (
    <MuiTextField
      label={formattedLabel}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || displayHelperText}
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
