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
      sx={{
        m: 0,
        '& .MuiInputBase-root': { backgroundColor: '#fff' },
        '& textarea': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(100, 116, 139, 0.45) rgba(148, 163, 184, 0.12)',
        },
        '& textarea::-webkit-scrollbar': { width: '8px' },
        '& textarea::-webkit-scrollbar-track': {
          background: 'rgba(148, 163, 184, 0.12)',
          borderRadius: '999px',
        },
        '& textarea::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(100, 116, 139, 0.45)',
          borderRadius: '999px',
        },
        '& textarea::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(71, 85, 105, 0.75)',
        },
        '& textarea::-webkit-scrollbar-button': {
          display: 'none',
          width: 0,
          height: 0,
        },
      }}
      inputRef={ref}
      {...props}
    />
  );
});

export default MultilinePlaceholder;
