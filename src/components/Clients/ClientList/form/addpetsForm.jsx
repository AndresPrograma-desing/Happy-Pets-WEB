import React from 'react';
import { handleFormChange } from '../utils';
import styles from './styles.module.css';
import CustomDatePicker from '../../../UI/CalendarComponent/CustomDatePicker';
import CustomSelect from '../../../UI/DesplegableSelector/CustomSelect';
import ErrorMessage from '../../../Notification/Error/ErrorMessage';

export default function AddPetsForm({ petForm, setPetForm, petError }) {
    return (
        <div className={styles.formContainer}>
            
            {petError && ( <ErrorMessage message={petError} /> )}

            <div className={styles.gridTwoColumns}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nombre *</label>
                    <input type="text" name="nombre" value={petForm.nombre} onChange={(e) => handleFormChange(e, setPetForm)} className={styles.inputField} required />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Especie *</label>
                    <input type="text" name="especie" value={petForm.especie} onChange={(e) => handleFormChange(e, setPetForm)} placeholder="Ej: Perro, Gato" className={styles.inputField} required />
                </div>
            </div>

            <div className={styles.gridTwoColumns}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Raza</label>
                    <input type="text" name="raza" value={petForm.raza} onChange={(e) => handleFormChange(e, setPetForm)} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Color</label>
                    <input type="text" name="color" value={petForm.color} onChange={(e) => handleFormChange(e, setPetForm)} className={styles.inputField} />
                </div>
            </div>

            <div className={styles.gridTwoColumns}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Sexo *</label>
                    <CustomSelect
                        label={""}
                        name="sexo"
                        value={petForm.sexo}
                        onChange={(value) => setPetForm(prev => ({ ...prev, sexo: value }))}
                        placeholder="Seleccionar..."
                        options={[
                            { id: 'Macho', name: 'Macho' },
                            { id: 'Hembra', name: 'Hembra' },
                        ]}
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Fecha de Nacimiento</label>
                    <CustomDatePicker
                        label={""}
                        name="fechaNacimiento"
                        value={petForm.fechaNacimiento}
                        onChange={(e) => handleFormChange(e, setPetForm)}
                        required
                    />
                </div>
            </div>

            <div className={styles.gridTwoColumns}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Peso (kg)</label>
                    <input type="number" step="0.01" name="peso" value={petForm.peso} onChange={(e) => handleFormChange(e, setPetForm)} className={styles.inputField} />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Identificación Código (Nro. Chip)</label>
                    <input type="text" name="identeficacionMascota" value={petForm.identeficacionMascota} onChange={(e) => handleFormChange(e, setPetForm)} className={styles.inputField} />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Alergias</label>
                <input type="text" name="alergias" value={petForm.alergias} onChange={(e) => handleFormChange(e, setPetForm)} placeholder="Ninguna" className={styles.inputField} />
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Condiciones Médicas</label>
                <input type="text" name="condicionesMedicas" value={petForm.condicionesMedicas} onChange={(e) => handleFormChange(e, setPetForm)} placeholder="Sano" className={styles.inputField} />
            </div>

            <div className={styles.checkboxGroup}>
                <input type="checkbox" id="esterilizado" name="esterilizado" checked={petForm.esterilizado} onChange={(e) => handleFormChange(e, setPetForm)} className={styles.checkboxInput} />
                <label htmlFor="esterilizado" className={styles.checkboxLabel}>La mascota se encuentra esterilizada</label>
            </div>
        </div>
    );
}