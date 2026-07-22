import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function Selector({
    label,
    value,
    onChange,
    options = [],
    id = "custom-autocomplete",
    style = {},
    className = "",
    fullWidth = true,
    placeholder,
    required,
    requiredColor = "red"
}) {
    const normalizeVal = (val) => String(val || '').toLowerCase().replace(/[_\s\/-]+/g, '');

    const selectedOption = (value !== "" && value !== undefined && value !== null) 
        ? options.find(opt => 
            String(opt.value) === String(value) || 
            normalizeVal(opt.value) === normalizeVal(value) ||
            normalizeVal(opt.label) === normalizeVal(value)
          ) || null 
        : null;

    const displayLabel = label ? (
        <span>
            {label}
            {required && <span style={{ color: requiredColor, marginLeft: '4px' }}>**</span>}
        </span>
    ) : undefined;

    return (
        <Autocomplete
            id={id}
            sx={{ width: fullWidth ? '100%' : 300, m: 0, ...style }}
            className={className}
            options={options}
            autoHighlight
            openOnFocus
            getOptionLabel={(option) => option.label || ""}
            value={selectedOption}
            onChange={(event, newValue) => {
                onChange({ target: { value: newValue ? newValue.value : "" } });
            }}
            isOptionEqualToValue={(option, val) => 
                String(option.value) === String(val?.value) ||
                normalizeVal(option.value) === normalizeVal(val?.value) ||
                normalizeVal(option.label) === normalizeVal(val?.label)
            }
            slotProps={{
                popper: {
                    sx: { zIndex: 100000 }
                }
            }}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <Box
                        key={key}
                        component="li"
                        sx={{ display: 'flex', alignItems: 'center', gap: '8px', ...optionProps.sx }}
                        {...optionProps}
                    >
                        {option.icon && <img src={option.icon} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />}
                        {option.label}
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={displayLabel}
                    placeholder={placeholder}
                    size="small"
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'off',
                        form: {
                            autocomplete: 'off',
                        },
                    }}
                    slotProps={{
                        ...params.slotProps,
                        htmlInput: {
                            ...params.slotProps?.htmlInput,
                            autoComplete: 'off',
                            name: 'no-autofill-' + Math.random(),
                        },
                    }}
                />
            )}
        />
    );
}