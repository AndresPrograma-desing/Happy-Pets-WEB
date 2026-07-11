import React, { forwardRef } from 'react';
import TextField from '../Material-UI/Components/TextField/Index';

const Input = forwardRef(({ label, id, className = '', containerClassName = '', error, helperText, ...props }, ref) => {
    return (
        <TextField
            id={id}
            label={label}
            error={error}
            helperText={error || helperText}
            ref={ref}
            className={className}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input;
