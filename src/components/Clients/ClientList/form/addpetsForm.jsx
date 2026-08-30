import React from 'react';
import { handleFormChange } from '../utils';
import styles from './styles.module.css';
import CalendarPicker from '../../../screens/components/CalendarPicker/Index';
import Selector from '../../../screens/components/Material-UI/Components/Selector/Index';
import Input from '../../../screens/components/Input/Index';
import Switch from '../../../screens/components/Swich/Index';
import ErrorMessage from '../../../Notification/Error/ErrorMessage';
import useSpecies from '../../../../hooks/useSpecies';

export default function AddPetsForm({ petForm, setPetForm, petError }) {
    const { speciesOptions } = useSpecies();

    return (
        <div className={styles.formContainer}>
            
            {petError && ( <ErrorMessage message={petError} /> )}

            <div className={styles.gridTwoColumns}>
                <div className={styles.inputGroup}>
                    <Input 
                        label="Nombre" 
                        name="nombre" 
                        value={petForm.nombre} 
                        onChange={(e) => handleFormChange(e, setPetForm)} 
                        required 
                    />
                </div>
                <div className={styles.inputGroup}>
                    <Selector
                        label="Especie"
                        value={petForm.especie}
                        onChange={(e) => setPetForm(prev => ({ ...prev, especie: e.target.value }))}
                        options={speciesOptions}
                        required
                    />
                </div>
            </div>

            <div className={styles.gridTwoColumns}>
                <div className={styles.inputGroup}>
                    <Input 
                        label="Raza" 
                        name="raza" 
                        value={petForm.raza} 
                        onChange={(e) => handleFormChange(e, setPetForm)} 
                    />
                </div>
                <div className={styles.inputGroup}>
                    <Input 
                        label="Color" 
                        name="color" 
                        value={petForm.color} 
                        onChange={(e) => handleFormChange(e, setPetForm)} 
                    />
                </div>
            </div>

            <div className={styles.gridTwoColumns}>
                <div className={styles.inputGroup}>
                    <Selector
                        label="Sexo"
                        value={petForm.sexo}
                        onChange={(e) => setPetForm(prev => ({ ...prev, sexo: e.target.value }))}
                        required
                        requiredColor='red'
                        options={[
                            { value: 'Macho', label: 'Macho' },
                            { value: 'Hembra', label: 'Hembra' },
                        ]}
                        
                    />
                </div>
                <div className={styles.inputGroup}>
                    <CalendarPicker
                        label="Fecha de Nacimiento"
                        name="fechaNacimiento"
                        value={petForm.fechaNacimiento}
                        onChange={(e) => handleFormChange(e, setPetForm)}
                        required
                    />
                </div>
            </div>

            <div className={styles.gridTwoColumns}>
                <div className={styles.inputGroup}>
                    <Input 
                        type="number" 
                        slotProps={{ htmlInput: { step: "0.01" } }}
                        label="Peso (kg)" 
                        name="peso" 
                        value={petForm.peso} 
                        onChange={(e) => handleFormChange(e, setPetForm)} 
                        required
                    />
                </div>
                <div className={styles.inputGroup}>
                    <Input 
                        label="Identificación Código (Nro. Chip)" 
                        name="identeficacionMascota" 
                        value={petForm.identeficacionMascota} 
                        onChange={(e) => handleFormChange(e, setPetForm)} 
                        required

                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <Input 
                    label="Alergias" 
                    name="alergias" 
                    value={petForm.alergias} 
                    onChange={(e) => handleFormChange(e, setPetForm)} 
                    placeholder="Ninguna" 
                />
            </div>

            <div className={styles.inputGroup}>
                <Input 
                    label="Condiciones Médicas" 
                    name="condicionesMedicas" 
                    value={petForm.condicionesMedicas} 
                    onChange={(e) => handleFormChange(e, setPetForm)} 
                    placeholder="Sano" 
                />
            </div>

            <div className={styles.checkboxGroup} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '0.75rem' }}>
                <Switch 
                    value={petForm.esterilizado} 
                    onChange={(newVal) => setPetForm(prev => ({ ...prev, esterilizado: newVal }))} 
                />
                <label className={styles.checkboxLabel} style={{ cursor: 'pointer', userSelect: 'none' }}>La mascota se encuentra esterilizada</label>
            </div>
        </div>
    );
}