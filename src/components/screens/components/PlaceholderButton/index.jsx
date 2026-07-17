import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import ModalTooltip from '../../../../components/ModalTooltip/ModalTooltip';
import styles from './index.module.css';
import { handleAction } from './utils';

import Button from '../Button/index';
import TextField from '../Material-UI/Components/TextField/Index';

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
          // Ctrl + Enter: insert newline manually
          e.preventDefault();
          const start = e.target.selectionStart;
          const end = e.target.selectionEnd;
          const val = e.target.value;
          setValue(val.substring(0, start) + "\n" + val.substring(end));
          setTimeout(() => {
            e.target.selectionStart = e.target.selectionEnd = start + 1;
          }, 0);
        } else {
          // Enter alone: submit
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
          <TextField
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            multiline
            maxRows={4}
            size="small"
            style={{ flex: 1 }}
          />
        ) : (
          <div className={styles.inputWrapper}>
            {Icon && tooltipText ? (
              <ModalTooltip text={tooltipText} position="top">
                <Icon size={18} className={styles.inputIcon} />
              </ModalTooltip>
            ) : Icon ? (
              <Icon size={18} className={styles.inputIcon} />
            ) : null}

            <input
              type={inputType}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={styles.daysInput}
              min={min}
              disabled={disabled}
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
