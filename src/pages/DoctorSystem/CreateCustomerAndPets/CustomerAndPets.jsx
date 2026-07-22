import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useClientAndPets from '../../../hooks/ClientAndPets';
import styles from './CustumerAndPets.module.css';
import CalendarPicker from '../../../components/screens/components/CalendarPicker/Index';
import AlertModal from '../../../components/AlertModal/AlertModal'; 
import { User, Mail, Phone, MapPin, IdCard, PawPrint, Award, Palette, HeartHandshake, Weight, Activity, ShieldAlert, Notebook,Dna } from 'lucide-react';
import GenericPanel from '../../../components/GenericPanel/GenericPanel';
import Button, { COLORS } from '../../../components/screens/components/Button';

const initialForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    identificacion: '',
    nota: '',
    mascota_nombre: '',
    especie: '',
    raza: '',
    color: '',
    sexo: '',
    fecha_nacimiento: '',
    peso: '',
    identeficacion_mascota: '',
    alergias: '',
    condiciones_medicas: '',
    esterilizado: false,
};
 
const REQUIRED_FIELDS = [
    'nombre', 'apellido', 'email', 'telefono', 'direccion', 'identificacion',
    'mascota_nombre', 'especie', 'raza', 'color', 'sexo', 'fecha_nacimiento',
    'peso', 'identeficacion_mascota'
];

export function CustomerAndPetsForm({ onCreated, onCancel, onError, submitting: submittingProp, serverError }) {
    const [form, setForm] = useState(initialForm);
    const [modalError, setModalError] = useState(null);  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { creating, createClientAndPet } = useClientAndPets();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError(null);
 
        const missingDetails = [];
        REQUIRED_FIELDS.forEach((field) => {
            if (!form[field] || String(form[field]).trim() === '') {
                missingDetails.push({
                    field: field,
                    message: 'is required'  
                });
            }
        });

        if (missingDetails.length > 0) { 
            setModalError({
                errors: missingDetails
            });
            setIsModalOpen(true);
            return;
        }

        // 2. Envío al backend
        try {
            const created = await createClientAndPet(form);
            if (typeof onCreated === 'function') onCreated(created);
            setForm(initialForm);
        } catch (err) {
             
            const isConflict = err?.status === 409 || /conflict/i.test(String(err?.body?.message || err?.message || ''));
            const fallbackMessage = isConflict
                ? 'Ya existe un usuario con los mismos datos.'
                : (err?.body?.message || err?.message || 'No se pudo crear el cliente con su mascota');

            setModalError(err?.body || err || fallbackMessage);
            setIsModalOpen(true);
            if (typeof onError === 'function') onError(err);
        }
    };

    const isSubmitting = creating || submittingProp;
 
    React.useEffect(() => {
        if (serverError) {
            setModalError(serverError);
            setIsModalOpen(true);
        }
    }, [serverError]);

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            
            {/* TU COMPONENTE ALERT MODAL INTEGRADO */}
            <AlertModal
                open={isModalOpen}
                title="Atención"
                message={modalError}
                confirmText="Aceptar"
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError(null);
                }}
            />

            <h3 className={styles.sectionTitle}>Datos del cliente</h3>
            
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nombre <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <User size={16} className={styles.inputIcon} />
                        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Apellido <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <User size={16} className={styles.inputIcon} />
                        <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Email <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <Mail size={16} className={styles.inputIcon} />
                        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Teléfono <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Dirección <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <MapPin size={16} className={styles.inputIcon} />
                        <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Identificación <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <IdCard size={16} className={styles.inputIcon} />
                        <input name="identificacion" placeholder="Identificación" value={form.identificacion} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nota</label>
                    <div className={styles.inputWrapper}>
                        <Notebook size={16} className={styles.inputIcon} />
                        <input name="nota" placeholder="Nota del cliente" value={form.nota} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <h3 className={styles.sectionTitle}>Datos de la mascota</h3>
            
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Nombre de mascota <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <PawPrint size={16} className={styles.inputIcon} />
                        <input name="mascota_nombre" placeholder="Nombre de mascota" value={form.mascota_nombre} onChange={handleChange} />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Especie <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <Dna size={16} className={styles.inputIcon} />
                        <input name="especie" placeholder="Especie" value={form.especie} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Raza <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <Award size={16} className={styles.inputIcon} />
                        <input name="raza" placeholder="Raza" value={form.raza} onChange={handleChange} />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Color <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <Palette size={16} className={styles.inputIcon} />
                        <input name="color" placeholder="Color" value={form.color} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Sexo <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <HeartHandshake size={16} className={styles.inputIcon} />
                        <input name="sexo" placeholder="Sexo" value={form.sexo} onChange={handleChange} />
                    </div>
                </div>
                <CalendarPicker
                    label="Fecha de nacimiento"
                    name="fecha_nacimiento"
                    value={form.fecha_nacimiento}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Peso (kg) <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <Weight size={16} className={styles.inputIcon} />
                        <input name="peso" type="number" step="0.1" placeholder="Peso" value={form.peso} onChange={handleChange} />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Identificación mascota <span className={styles.reqStar}>*</span></label>
                    <div className={styles.inputWrapper}>
                        <IdCard size={16} className={styles.inputIcon} />
                        <input name="identeficacion_mascota" placeholder="Identificación mascota" value={form.identeficacion_mascota} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Alergias</label>
                    <div className={styles.inputWrapper}>
                        <ShieldAlert size={16} className={styles.inputIcon} />
                        <input name="alergias" placeholder="Alergias" value={form.alergias} onChange={handleChange} />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Condiciones médicas</label>
                    <div className={styles.inputWrapper}>
                        <Activity size={16} className={styles.inputIcon} />
                        <input name="condiciones_medicas" placeholder="Condiciones médicas" value={form.condiciones_medicas} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <label className={styles.checkRow}>
                    <input name="esterilizado" type="checkbox" checked={form.esterilizado} onChange={handleChange} />
                    Esterilizado
                </label>
            </div>

            <div className={styles.actions}>
                <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando registro' : 'Crear Cliente y Mascota'}
                </Button>
                <Button 
                variant="contained" 
                color={COLORS.TRANSPARENT} 
                borderColor="var('--border-gray-low')" 
                onClick={onCancel} 
                disabled={isSubmitting}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}

export default function CustomerAndPets() {
    const navigate = useNavigate();

    return (
        <GenericPanel title="Crear Cliente y Mascota" message="Registra un nuevo usuario con los detalles de su mascota" role="secretaria">
            <div className={styles.container}>
                <CustomerAndPetsForm onCreated={() => navigate(-1)} onCancel={() => navigate(-1)} />
            </div>
        </GenericPanel>
    );
}