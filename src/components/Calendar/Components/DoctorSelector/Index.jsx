import React from 'react';
import { User } from 'lucide-react';
import Selector from '../../../screens/components/Material-UI/Components/Selector/Index.jsx';
import { TEXTS } from '../../constants';
import styles from './Index.module.css';

export default function DoctorSelector({ doctorOptions, selectedDoctorId, onChange }) {
  return (
    <div className={styles.doctorFilterCard}>
      <div className={styles.filterHeader}>
        <User size={18} color="var(--button-green)" />
        <span>{TEXTS.LABEL_DOCTOR}</span>
      </div>
      <div className={styles.selectorWrapper}>
        <Selector
          options={doctorOptions}
          value={selectedDoctorId}
          onChange={onChange}
          placeholder="Seleccione un doctor..."
        />
      </div>
    </div>
  );
}