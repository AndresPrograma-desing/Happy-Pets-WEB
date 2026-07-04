import React, { useState } from 'react';
import styles from './NotificationForm.module.css';
import { createdNotification } from '../../services/api';
import ErrorMessage from '../Notification/Error/ErrorMessage';
import CustomSelect from '../UI/DesplegableSelector/CustomSelect';
import Button from '../screens/components/Button/index';

const actorOptions = [
  { id: 'Doctor', name: 'Doctor' },
  { id: 'Admin', name: 'Admin' },
  { id: 'Secretaria', name: 'Secretaria' }
];

const typeOptions = [
  { id: 'Normal', name: 'Normal' },
  { id: 'Urgent', name: 'Urgente' },
  { id: 'Info', name: 'Información' }
];

const priorityOptions = [
  { id: '1', name: 'Baja (1)' },
  { id: '2', name: 'Media (2)' },
  { id: '3', name: 'Alta (3)' }
];

const NotificationForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: '',
    priority: '',
    destination: '',
    origin: '',
    completed: false,
    is_read: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleCustomSelectChange = (fieldName, selectedId) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedId
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.message.trim() ||
      !formData.type ||
      !formData.priority ||
      !formData.origin ||
      !formData.destination
    ) {
      setError('Por favor, rellene todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createdNotification(formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al intentar crear la notificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <ErrorMessage message={error} title="Error de validación" variant="danger" />

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Título *</label>
        <input
          type="text"
          name="title"
          className={styles.input}
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Mensaje de Alerta *</label>
        <textarea
          name="message"
          className={styles.textarea}
          value={formData.message}
          onChange={handleChange}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <CustomSelect
            label="Tipo *"
            options={typeOptions}
            value={formData.type}
            onChange={(selectedId) => handleCustomSelectChange('type', selectedId)}
            placeholder="Seleccione tipo"
          />
        </div>

        <div className={styles.fieldGroup}>
          <CustomSelect
            label="Prioridad *"
            options={priorityOptions}
            value={formData.priority}
            onChange={(selectedId) => handleCustomSelectChange('priority', selectedId)}
            placeholder="Seleccione prioridad"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <CustomSelect
            label="Origen *"
            options={actorOptions}
            value={formData.origin}
            onChange={(selectedId) => handleCustomSelectChange('origin', selectedId)}
            placeholder="Seleccione origen"
          />
        </div>

        <div className={styles.fieldGroup}>
          <CustomSelect
            label="Destino *"
            options={actorOptions}
            value={formData.destination}
            onChange={(selectedId) => handleCustomSelectChange('destination', selectedId)}
            placeholder="Seleccione destino"
          />
        </div>
      </div>

      <div className={styles.actions} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading} fullWidth>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" color={Button.COLORS.PRIMARY} disabled={loading} fullWidth>
          {loading ? 'Enviando...' : 'Crear Notificación'}
        </Button>
      </div>
    </form>
  );
};

export default NotificationForm;