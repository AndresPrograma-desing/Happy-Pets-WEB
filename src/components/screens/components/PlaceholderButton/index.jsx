import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import styles from './index.module.css';
import { handleAction } from './utils';

import Button from '../Button/index';
import InputWithIcon from '../Material-UI/Components/InputWithIcon/Index'; 

const PlaceholderButton = ({
  icon: Icon,
  tooltipText, 
  placeholder,
  unitText,
  buttonText,
  hintText,
  disabledHintText,
  
  initialValue = '',
  inputType = 'number',
  min = "1",
  disabled = false,
  multiline = false,
  
  onSavePromise,
  clearCache,
  
  successMessage,
  errorMessage,
  validationErrorMsg,
  clearOnSuccess = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onSaveClick = () => {
    handleAction({
      actionPromise: onSavePromise,
      value: inputType === 'number' ? parseInt(value) : value,
      setIsSaving,
      setMessage,
      clearCache,
      successMessage,
      errorMessage,
      validationErrorMsg,
      validate: (v) => inputType === 'number' ? (v && v >= 1) : !!v,
      setValue,
      clearOnSuccess
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (multiline) {
        if (e.ctrlKey) {
          e.preventDefault();
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          const val = e.target.value;
          setValue(val.substring(0, start) + "\n" + val.substring(end));
          setTimeout(() => {
            e.target.selectionStart = e.target.selectionEnd = start + 1;
          }, 0);
        } else {
          e.preventDefault();
          if (!isSaving && !disabled) {
            onSaveClick();
          }
        }
      } else {
        if (!isSaving && !disabled) {
          e.preventDefault();
          onSaveClick();
        }
      }
    }
  };

  return (
    <div className={`${styles.configContainer} ${disabled ? styles.disabledContainer : ''}`}>
      <div className={styles.inputGroup}>
        {multiline ? (
          <InputWithIcon
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            multiline
            maxRows={4}
            variant="outlined" 
            style={{ flex: 1 }}
          />
        ) : (
          <div className={styles.inputWrapper}>
            <InputWithIcon
              variant="standard" 
              icon={Icon}
              type={inputType}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              disableUnderline  
              fullWidth
              inputProps={{ 
                min: min, 
                className: styles.daysInput 
              }}
              sx={{ 
                '& .MuiInput-root': {
                  height: '100%',
                  marginTop: '0px !important',
                },
                flex: 1
              }}
            />
            {unitText && <span className={styles.unitText}>{unitText}</span>}
          </div>
        )}

        <Button
          variant={Button.VARIANTS.PRIMARY}
          size={Button.SIZES.LARGE}
          icon={isSaving ? Loader2 : Save}
          color={Button.COLORS.BLUE}
          onClick={onSaveClick}
          loading={isSaving}
        >
          {buttonText}
        </Button>
      </div>

      {disabled && disabledHintText && (
        <p className={styles.infoTextDisabled}>
          {disabledHintText}
        </p>
      )}

      {message.text && (
        <p className={`${styles.statusMessage} ${styles[message.type]}`}>
          {message.text}
        </p>
      )}

      {hintText && (
        <p className={styles.hintText}>
          {hintText}
        </p>
      )}
    </div>
  );
};

export default PlaceholderButton;