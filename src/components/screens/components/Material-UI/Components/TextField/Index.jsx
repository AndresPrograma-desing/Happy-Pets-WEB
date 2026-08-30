import React, { forwardRef } from 'react';
import MuiTextField from '@mui/material/TextField';
import { formatHighlightedText } from '../../../GreenHighlight/utils.jsx';
import CustomDatePicker from '../../../CalendarComponent/CustomDatePicker';

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
  if (type === 'date') {
    return (
      <CustomDatePicker
        label={label}
        name={props.name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={props.disabled}
      />
    );
  }

  const formattedLabel = typeof label === 'string' ? formatHighlightedText(label) : label;
  const displayLabel = formattedLabel ? (
    <span>
      {formattedLabel}
      {required && <span style={{ color: requiredColor, marginLeft: '4px' }}>**</span>}
    </span>
  ) : undefined;

  const displayHelperText = typeof helperText === 'string' ? formatHighlightedText(helperText) : helperText;

  return (
    <MuiTextField
      label={displayLabel}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error || displayHelperText}
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      placeholder={placeholder}
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

TextField.displayName = 'TextField';

export default TextField;