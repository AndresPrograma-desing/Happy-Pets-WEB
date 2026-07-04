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
    placeholder
}) {
    // Autocomplete expects the entire object as value, so we find it in options
    const selectedOption = value !== "" && value !== undefined && value !== null 
        ? options.find(opt => String(opt.value) === String(value)) || null 
        : null;

    return (
        <Autocomplete
            id={id}
            sx={{ width: fullWidth ? '100%' : 300, m: 0, ...style }}
            className={className}
            options={options}
            autoHighlight
            getOptionLabel={(option) => option.label || ""}
            value={selectedOption}
            onChange={(event, newValue) => {
                // Mock standard event structure for drop-in replacement compatibility
                onChange({ target: { value: newValue ? newValue.value : "" } });
            }}
            isOptionEqualToValue={(option, val) => String(option.value) === String(val?.value)}
            renderOption={(props, option) => {
                // Extract key to avoid React warnings in MUI Autocomplete
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
                    label={label}
                    placeholder={placeholder}
                    size="small"
                    slotProps={{
                        ...params.slotProps,
                        htmlInput: {
                            ...params.slotProps.htmlInput,
                            autoComplete: 'new-password', // disable autocomplete and autofill
                        },
                    }}
                />
            )}
        />
    );
}
