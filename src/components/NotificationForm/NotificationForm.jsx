import React, { useState, useEffect } from 'react';
import styles from './NotificationForm.module.css';
import { createdNotification } from '../../services/api';
import ErrorMessage from '../Notification/Error/ErrorMessage';
import Selector from '../screens/components/Material-UI/Components/Selector/Index';
import MultilinePlaceholder from '../screens/components/Material-UI/Components/MultilinePlaceholder/index';
import TextField from '../screens/components/Material-UI/Components/TextField/Index';
import { getUserRole } from '../GenericPanel/Routes';
import { NOTIFICATION_FORM_TEXTS } from './constants';

const actorOptions = [
  { value: 'Doctor', label: 'Doctor' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Secretaria', label: 'Secretaria' }
];

const typeOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Urgent', label: 'Urgente' },
  { value: 'Info', label: 'Información' }
];

const priorityOptions = [
  { value: '1', label: 'Baja (1)' },
  { value: '2', label: 'Media (2)' },
  { value: '3', label: 'Alta (3)' }
];

const roleMap = {
  admin: 'Admin',
  doctor: 'Doctor',
  secretaria: 'Secretaria'
};

const NotificationForm = ({ onSuccess, onClose, onLoading }) => {
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

  useEffect(() => {
    const role = getUserRole();
    const originRole = roleMap[role] || (role ? role.charAt(0).toUpperCase() + role.slice(1) : '');
    if (originRole) {
      setFormData((prev) => ({
        ...prev,
        origin: originRole
      }));
    }
  }, []);

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
      setError(NOTIFICATION_FORM_TEXTS.validationErrorMessage);
      return;
    }

    setLoading(true);
    if (onLoading) onLoading(true);
    setError('');

    try {
      await createdNotification(formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(NOTIFICATION_FORM_TEXTS.submitErrorMessage);
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  return (
    <form id="notification-form" onSubmit={handleSubmit} className={styles.formContainer}>
      <ErrorMessage message={error} title={NOTIFICATION_FORM_TEXTS.validationErrorTitle} variant="danger" />

      <div className={styles.fieldGroup}>
        <TextField
          label={NOTIFICATION_FORM_TEXTS.titleLabel}
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      <div className={styles.fieldGroup}>
        <MultilinePlaceholder
          label={NOTIFICATION_FORM_TEXTS.messageLabel}
          name="message"
          value={formData.message}
          onChange={handleChange}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <Selector
            label={NOTIFICATION_FORM_TEXTS.typeLabel}
            options={typeOptions}
            value={formData.type}
            onChange={(e) => handleCustomSelectChange('type', e.target.value)}
            placeholder={NOTIFICATION_FORM_TEXTS.typePlaceholder}
          />
        </div>

        <div className={styles.fieldGroup}>
          <Selector
            label={NOTIFICATION_FORM_TEXTS.priorityLabel}
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) => handleCustomSelectChange('priority', e.target.value)}
            placeholder={NOTIFICATION_FORM_TEXTS.priorityPlaceholder}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <Selector
          label={NOTIFICATION_FORM_TEXTS.destinationLabel}
          options={actorOptions}
          value={formData.destination}
          onChange={(e) => handleCustomSelectChange('destination', e.target.value)}
          placeholder={NOTIFICATION_FORM_TEXTS.destinationPlaceholder}
        />
      </div>
    </form>
  );
};

export default NotificationForm;