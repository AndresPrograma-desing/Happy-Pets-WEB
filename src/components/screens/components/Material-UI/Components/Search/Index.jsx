import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

export default function Search({
  open,
  onOpen,
  onClose,
  options = [],
  loading = false,
  value,
  onChange,
  inputValue,
  onInputChange,
  getOptionLabel = (option) => option?.label || "",
  isOptionEqualToValue = (option, val) => option?.value === val?.value,
  label = "Buscar",
  placeholder = "Buscar...",
  freeSolo = false,
  ...props
}) {
  // Fallback to plain TextField if we are just doing local free text search without options
  if (freeSolo && options.length === 0) {
    return (
      <TextField
        value={value}
        onChange={(e) => {
          if (onChange) onChange(e.target.value);
        }}
        label={label}
        placeholder={placeholder}
        size="small"
        fullWidth
        {...props}
      />
    );
  }

  return (
    <Autocomplete
      fullWidth
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      value={value}
      onChange={(event, newValue) => {
        if (onChange) onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        if (onInputChange) onInputChange(newInputValue);
      }}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionLabel={getOptionLabel}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size="small"
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps?.input,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.slotProps?.input?.endAdornment}
                </React.Fragment>
              ),
            },
          }}
        />
      )}
      {...props}
    />
  );
}
