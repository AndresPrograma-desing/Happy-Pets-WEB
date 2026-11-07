import React from 'react';
import { createPortal } from 'react-dom';
import styles from './AlertModal.module.css';
import { getIcon } from '../../assets/icons/ExportIcon/Index';
import Button from '../screens/components/Button/index';
import TextField from '../screens/components/Material-UI/Components/TextField/Index';
import Selector from '../screens/components/Material-UI/Components/Selector/Index';


const FIELD_LABELS = {
  nombre: 'Nombre',
  apellido: 'Apellido',
  email: 'Correo electronico',
  telefono: 'Telefono',
  direccion: 'Direccion',
  identificacion: 'Cédula',
  mascota_nombre: 'Nombre de la mascota',
  especie: 'Especie',
  raza: 'Raza',
  color: 'Color',
  sexo: 'Sexo',
  fecha_nacimiento: 'Fecha de nacimiento',
  peso: 'Peso',
  identeficacion_mascota: 'Identificacion de mascota',
  alergias: 'Alergias',
  condiciones_medicas: 'Condiciones medicas',
  esterilizado: 'Esterilizado',
  id_cliente: 'Cliente',
  cliente_id: 'Cliente',
};

function humanizeField(field) {
  const key = String(field || '').trim();
  if (!key) return '';
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const normalized = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function translateText(input) {
  const text = String(input || '').trim();
  if (!text) return '';

  return text
    .replace(/\bvalidation error\b/gi, 'Error de validacion')
    .replace(/\bfailed validation\b/gi, 'fallo de validacion')
    .replace(/\bis required\b/gi, 'es obligatorio')
    .replace(/\bmust not be empty\b/gi, 'no puede estar vacio')
    .replace(/\bcannot be empty\b/gi, 'no puede estar vacio')
    .replace(/\bmust be a valid email\b/gi, 'debe ser un correo electronico valido')
    .replace(/\binvalid email\b/gi, 'correo electronico invalido')
    .replace(/\binvalid\b/gi, 'invalido')
    .replace(/\balready exists\b/gi, 'ya existe')
    .replace(/\balready registered\b/gi, 'ya esta registrado')
    .replace(/\btoo short\b/gi, 'es demasiado corto')
    .replace(/\btoo long\b/gi, 'es demasiado largo')
    .replace(/\bmust be\b/gi, 'debe ser')
    .replace(/\bmust contain\b/gi, 'debe contener')
    .replace(/\bnot found\b/gi, 'no fue encontrado')
    .replace(/\bbad request\b/gi, 'solicitud invalida')
    .replace(/\bserver error\b/gi, 'error del servidor');
}

function extractErrorLines(raw) {
  if (raw == null || raw === false) return [];

  if (typeof raw === 'string' || typeof raw === 'number') {
    const line = translateText(raw);
    return line ? [line] : [];
  }

  if (Array.isArray(raw)) {
    return raw.flatMap((item) => extractErrorLines(item));
  }

  if (typeof raw !== 'object') return [];

  const objectLines = [];

  // ValidationProblemDetails de ASP.NET ({ errors: { Campo: ["msg1", "msg2"] } }): `errors` es un
  // objeto por campo, no un array, así que no entra al forEach de abajo y el modal quedaba vacío.
  const dictSources = [raw?.errors, raw?.body?.errors].filter((d) => d && typeof d === 'object' && !Array.isArray(d));
  dictSources.forEach((dict) => {
    Object.entries(dict).forEach(([field, messages]) => {
      const fieldLabel = humanizeField(field);
      const msgs = Array.isArray(messages) ? messages : [messages];
      msgs.filter(Boolean).forEach((msg) => {
        const translated = translateText(String(msg));
        objectLines.push(fieldLabel ? `${fieldLabel}: ${translated}` : translated);
      });
    });
  });

  const listSources = [raw?.errors, raw?.details, raw?.body?.errors, raw?.body?.details].filter(Boolean);

  listSources.forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((item) => {
      if (typeof item === 'string') {
        const translated = translateText(item);
        if (translated) objectLines.push(translated);
        return;
      }

      const field =
        item?.field ??
        item?.path ??
        item?.param ??
        item?.property ??
        (Array.isArray(item?.instancePath) ? item.instancePath.join('.') : item?.instancePath) ??
        (Array.isArray(item?.path) ? item.path.join('.') : item?.path) ??
        '';
      const fieldLabel = humanizeField(field);

      const detailMsg =
        item?.message ??
        item?.msg ??
        item?.error ??
        item?.description ??
        (item?.constraints && Object.values(item.constraints).join(', '));

      const translatedDetail = translateText(detailMsg || 'Dato invalido');
      objectLines.push(fieldLabel ? `${fieldLabel}: ${translatedDetail}` : translatedDetail);
    });
  });

  if (objectLines.length) return objectLines;

  const topLevel = [raw?.body?.message, raw?.message, raw?.error, raw?.body?.error].filter(Boolean);
  if (topLevel.length) return topLevel.map((line) => translateText(line));

  return [];
}

function formatModalMessage(message) {
  const lines = extractErrorLines(message).filter(Boolean);
  if (!lines.length) {
    return {
      text: typeof message === 'string' ? message : '',
      list: [],
    };
  }

  const deduped = Array.from(new Set(lines));
  return {
    text: deduped.length === 1 ? deduped[0] : '',
    list: deduped.length > 1 ? deduped : [],
  };
}

export default function AlertModal({
  open,
  title = 'Alerta',
  message = '',
  onClose,
  onConfirm,
  confirmText = 'Ok',
  cancelText = 'Cancelar',
  hideActions = false,
  children,
  showInput = false,
  inputType = 'text',
  inputLabel = '',
  inputPlaceholder = '',
  inputValue = '',
  onInputChange,
  inputOptions = [],
  inputError = '',
  imageUrl = '',
  showWarningIcon = true,
}) {
  if (!open) return null;

  const parsed = formatModalMessage(message);

  const content = (
    <div data-test="alert-modal" className={styles.modalOverlay} onClick={onClose || (() => { })}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>
          {showWarningIcon && <img src={getIcon('warning')} alt="alert" className={styles.warningIcon} />}
          {title}</h3>
        <div className={styles.modalBody}>
          {imageUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px', marginBottom: '16px' }}>
              <img 
                src={imageUrl} 
                alt="preview" 
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '6px', objectFit: 'contain' }} 
              />
            </div>
          )}
          {parsed.text && <p className={styles.modalText}>{parsed.text}</p>}
          {parsed.list.length > 0 && (
            <ul className={styles.modalErrorList}>
              {parsed.list.map((line, index) => (
                <li key={`${line}-${index}`} className={styles.modalErrorItem}>{line}</li>
              ))}
            </ul>
          )}

          {/* Render native inputs if requested via props */}
          {showInput && inputType === 'select' && (
            <div style={{ marginTop: '16px', marginBottom: '8px' }}>
              <Selector
                label={inputLabel}
                value={inputValue}
                onChange={onInputChange}
                options={inputOptions}
                placeholder={inputPlaceholder}
              />
            </div>
          )}

          {showInput && inputType !== 'select' && (
            <div style={{ marginTop: '16px', marginBottom: '8px' }}>
              <TextField
                type={inputType}
                label={inputLabel}
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={onInputChange}
                error={!!inputError}
                helperText={inputError}
                fullWidth
              />
            </div>
          )}

          {/* Render passed children (e.g., a form) or nothing by default */}
          {children}
        </div>

        {!hideActions && (
          <div className={styles.modalActions} style={{ marginTop: 12 }}>
            {typeof onClose === 'function' && (
              <Button 
                fullWidth
                borderColor="var(--border-gray-low)"
                onClick={onClose}>{cancelText}
              </Button>
            )}

            {typeof onConfirm === 'function' ? (
              <Button
                fullWidth  
                // borderColor="var(--border-gray-low)"
                onClick={onConfirm}>{confirmText}</Button>
            ) : (
              <Button variant="primary" 
                fullWidth 
                onClick={onClose || (() => { })}>{confirmText}</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
