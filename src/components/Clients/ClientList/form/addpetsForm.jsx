import React from 'react';
import { handleFormChange } from '../utils';
import styles from './styles.module.css';
import CalendarPicker from '../../../screens/components/CalendarPicker/Index';
import Selector from '../../../screens/components/Material-UI/Components/Selector/Index';
import Switch from '../../../screens/components/Swich/Index';
import ErrorMessage from '../../../Notification/Error/ErrorMessage';
import useSpecies from '../../../../hooks/useSpecies';
import { Input, ProfileAvatar } from 'anteriority-ui';
import useImagePicker from '../../../../hooks/useImagePicker';

export default function AddPetsForm({ petForm, setPetForm, petError, petImage, setPetImage, currentImageUrl }) {
    const { speciesOptions } = useSpecies();
    const picker = useImagePicker(petImage, setPetImage);

    return (
        <div className={styles.formContainer}>
            
            {petError && ( <ErrorMessage message={petError} /> )}

            {setPetImage && (
                <div className={styles.inputGroup} style={{ alignItems: 'center' }}>
                    <input type="file" ref={picker.inputRef} accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={picker.handleSelect} />
                    <ProfileAvatar
                        src={picker.preview || currentImageUrl}
                        name={petForm.nombre || 'Mascota'}
                        size={80}
                        editable
                        onEditClick={picker.openPicker}
                    />
                    <span style={{ fontSize: '0.8rem', color: picker.error ? '#d32f2f' : '#64748b' }}>
                        {picker.error || 'Foto de la mascota (opcional, máx. 5 MB)'}
                    </span>
                </div>
            )}

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
                        numeric
                        allowDecimal
                        min={0}
                        step={0.1}
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