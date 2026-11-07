import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import useClientAndPets from '../../../hooks/ClientAndPets';
import { createPetForExistingClient } from '../../../services/api';
import styles from './CustumerAndPets.module.css';
import CalendarPicker from '../../../components/screens/components/CalendarPicker/Index';
import AlertModal from '../../../components/AlertModal/AlertModal'; 
import { User, Mail, Phone, MapPin, IdCard, PawPrint, Award, Palette, HeartHandshake, Weight, Activity, ShieldAlert, Notebook,Dna } from 'lucide-react';
import usePanelHeader from '../../../components/GenericPanel/usePanelHeader';
import Button from '../../../components/screens/components/Button';
import TextField from '../../../components/screens/components/Material-UI/Components/TextField/Index';
import Selector from '../../../components/screens/components/Material-UI/Components/Selector/Index';
import CountdownBar from '../../../components/screens/components/CountdownBar';
import Switch from '../../../components/screens/components/Swich/Index';
import useSpecies from '../../../hooks/useSpecies';
import { Input, ProfileAvatar } from 'anteriority-ui';
import useImagePicker from '../../../hooks/useImagePicker';
import { DrawPanelFooterContext } from '../../../components/screens/components/DrawPanel/FooterContext';
import { isValidEmail, isValidTelefono, isNonNegativeNumber, isValidCedula, buildCedula, CEDULA_TIPOS, soloDigitos } from '../../../utils/validation';

const FORM_ID = 'customerAndPetsForm';

const initialForm = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo_cedula: 'V',
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
 
const SEXO_OPTIONS = [
    { value: 'Macho', label: 'Macho' },
    { value: 'Hembra', label: 'Hembra' },
];

const PET_REQUIRED_FIELDS = [
    'mascota_nombre', 'especie', 'raza', 'color', 'sexo', 'fecha_nacimiento',
    'peso', 'identeficacion_mascota'
];

const REQUIRED_FIELDS = [
    'nombre', 'apellido', 'email', 'telefono', 'direccion', 'identificacion',
    'mascota_nombre', 'especie', 'raza', 'color', 'sexo', 'fecha_nacimiento',
    'peso', 'identeficacion_mascota'
];

export function CustomerAndPetsForm({ onCreated, onCancel, onError, submitting: submittingProp, serverError }) {
    const [form, setForm] = useState(initialForm);
    const [modalError, setModalError] = useState(null);  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientImage, setClientImage] = useState(null);
    const [petImage, setPetImage] = useState(null);
    const [pendingCreated, setPendingCreated] = useState(null);
    const [clienteCreado, setClienteCreado] = useState(null);
    const clientPicker = useImagePicker(clientImage, setClientImage);
    const petPicker = useImagePicker(petImage, setPetImage);
    const { creating, createClientAndPet } = useClientAndPets();
    const { speciesOptions } = useSpecies();
    const footerNode = useContext(DrawPanelFooterContext);

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
 
        if (clienteCreado) {
            const faltantes = PET_REQUIRED_FIELDS.filter((f) => !String(form[f] ?? '').trim());
            if (faltantes.length > 0) {
                setModalError({ errors: faltantes.map((field) => ({ field, message: 'is required' })) });
                setIsModalOpen(true);
                return;
            }
            try {
                await createPetForExistingClient({
                    clienteId: clienteCreado.id,
                    nombre: form.mascota_nombre.trim(),
                    especie: form.especie.trim(),
                    raza: form.raza.trim(),
                    color: form.color.trim(),
                    sexo: form.sexo.trim(),
                    fechaNacimiento: form.fecha_nacimiento.trim(),
                    peso: form.peso === '' ? null : Number(form.peso),
                    identeficacionMascota: form.identeficacion_mascota.trim(),
                    alergias: form.alergias.trim(),
                    esterilizado: Boolean(form.esterilizado),
                });
                setForm((prev) => ({ ...prev, mascota_nombre: '', especie: '', raza: '', color: '', sexo: '', fecha_nacimiento: '', peso: '', identeficacion_mascota: '', alergias: '', condiciones_medicas: '', esterilizado: false }));
                setModalError(`Mascota agregada a ${clienteCreado.nombre}.`);
                setIsModalOpen(true);
            } catch (err) {
                setModalError(err?.body || err || 'No se pudo agregar la mascota');
                setIsModalOpen(true);
            }
            return;
        }

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

        const formatErrors = [];
        if (form.email && !isValidEmail(form.email)) {
            formatErrors.push({ field: 'email', message: 'no tiene un formato válido' });
        }
        if (form.telefono && !isValidTelefono(form.telefono)) {
            formatErrors.push({ field: 'telefono', message: 'debe contener solo números' });
        }
        if (!isValidCedula(buildCedula(form.tipo_cedula, form.identificacion))) {
            formatErrors.push({ field: 'identificacion', message: 'debe tener entre 6 y 8 dígitos' });
        }
        if (form.peso !== '' && !isNonNegativeNumber(form.peso)) {
            formatErrors.push({ field: 'peso', message: 'debe ser un número mayor o igual a cero' });
        }
        if (formatErrors.length > 0) {
            setModalError({ errors: formatErrors });
            setIsModalOpen(true);
            return;
        }

        try {
            const created = await createClientAndPet(form, { clientImage, petImage });
            setClientImage(null);
            setPetImage(null);
            if (created?.imageWarning) {
                setPendingCreated(created);
                setModalError(created.imageWarning);
                setIsModalOpen(true);
            }
            setClienteCreado({ id: created.clienteId, nombre: created.clienteNombre || form.nombre });
            setForm((prev) => ({ ...initialForm, nombre: prev.nombre, apellido: prev.apellido, email: prev.email, telefono: prev.telefono, direccion: prev.direccion, tipo_cedula: prev.tipo_cedula, identificacion: prev.identificacion }));
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

    const filledFieldsCount = REQUIRED_FIELDS.filter((field) => {
        const val = form[field];
        return val !== undefined && val !== null && String(val).trim() !== '';
    }).length;

    const totalFields = REQUIRED_FIELDS.length;
    const progressValue = (filledFieldsCount / totalFields) * 100;

    const actionButtons = (
        <>
            <Button type="submit" form={FORM_ID} variant="primary" loading={isSubmitting} fullWidth={!!footerNode}>
                {isSubmitting ? 'Guardando registro' : 'Crear Cliente y Mascota'}
            </Button>
            <Button type="button" border={Button.COLORS.RED} onClick={onCancel} disabled={isSubmitting} fullWidth={!!footerNode}>
                Cancelar
            </Button>
        </>
    );

    return (
        <form id={FORM_ID} onSubmit={handleSubmit} className={styles.form} noValidate>
            
            <AlertModal
                open={isModalOpen}
                title="Atención"
                message={modalError}
                confirmText="Aceptar"
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError(null);
                    if (pendingCreated) {
                        const created = pendingCreated;
                        setPendingCreated(null);
                        if (typeof onCreated === 'function') onCreated(created);
                    }
                }}
            />

            <div style={{ gridColumn: '1 / -1', marginBottom: '10px' }}>
                <CountdownBar 
                active={true} 
                value={progressValue} />
            </div>

            <h3 className={styles.sectionTitle}>Datos del cliente</h3>

            <div className={styles.imageRow}>
                <input type="file" ref={clientPicker.inputRef} accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={clientPicker.handleSelect} />
                <ProfileAvatar
                    src={clientPicker.preview}
                    name={`${form.nombre} ${form.apellido}`.trim() || 'Cliente'}
                    size={80}
                    editable={!isSubmitting}
                    onEditClick={clientPicker.openPicker}
                />
                <span className={styles.imageHint}>
                    {clientPicker.error || 'Foto del cliente (opcional, máx. 5 MB)'}
                </span>
            </div>
{/* <p style={{ color: 'red', fontSize: '12px' }}>Todo lo que esta en ** es obligatorio</p> */}
            <div className={styles.row}>
                <TextField
                    label="Nombre"
                    name="nombre"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Apellido"
                    name="apellido"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.row}>
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Teléfono"
                    name="telefono"
                    placeholder="Solo números"
                    value={form.telefono}
                    onChange={(e) => setForm(prev => ({ ...prev, telefono: soloDigitos(e.target.value) }))}
                    inputProps={{ inputMode: 'numeric' }}
                    required
                />
            </div>

            <div className={styles.row}>
                <TextField
                    label="Dirección"
                    name="direccion"
                    placeholder="Dirección"
                    value={form.direccion}
                    onChange={handleChange}
                    required
                />
                <Selector
                    label="Tipo de documento"
                    value={form.tipo_cedula}
                    onChange={(e) => setForm(prev => ({ ...prev, tipo_cedula: e.target.value }))}
                    options={CEDULA_TIPOS}
                    required
                />
                <TextField
                    label="Cédula"
                    name="identificacion"
                    placeholder="Solo números"
                    value={form.identificacion}
                    onChange={(e) => setForm(prev => ({ ...prev, identificacion: e.target.value.replace(/\D/g, '') }))}
                    inputProps={{ inputMode: 'numeric', maxLength: 8 }}
                    required
                />
            </div>

            <div className={styles.row}>
                <TextField
                    label="Nota"
                    name="nota"
                    placeholder="Nota del cliente"
                    value={form.nota}
                    onChange={handleChange}
                />
            </div>

            <h3 className={styles.sectionTitle}>Datos de la mascota</h3>

            <div className={styles.imageRow}>
                <input type="file" ref={petPicker.inputRef} accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }} onChange={petPicker.handleSelect} />
                <ProfileAvatar
                    src={petPicker.preview}
                    name={form.mascota_nombre || 'Mascota'}
                    size={80}
                    editable={!isSubmitting}
                    onEditClick={petPicker.openPicker}
                />
                <span className={styles.imageHint}>
                    {petPicker.error || 'Foto de la mascota (opcional, máx. 5 MB)'}
                </span>
            </div>

            <div className={styles.row}>
                <TextField
                    label="mascota"
                    name="mascota_nombre"
                    placeholder="Nombre de mascota"
                    value={form.mascota_nombre}
                    onChange={handleChange}
                    required
                />
                <Selector
                    label="Especie"
                    value={form.especie}
                    onChange={(e) => setForm(prev => ({ ...prev, especie: e.target.value }))}
                    options={speciesOptions}
                    required
                />
            </div>

            <div className={styles.row}>
                <TextField
                    label="Raza"
                    name="raza"
                    placeholder="Raza"
                    value={form.raza}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Color"
                    name="color"
                    placeholder="Color"
                    value={form.color}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.row}>
                <Selector
                    label="Sexo"
                    value={form.sexo}
                    onChange={(e) => setForm(prev => ({ ...prev, sexo: e.target.value }))}
                    options={SEXO_OPTIONS}
                    required
                />
                <CalendarPicker
                    label="Fecha de nacimiento"
                    name="fecha_nacimiento"
                    value={form.fecha_nacimiento}
                    onChange={handleChange}
                    required
                    maxDate={new Date()}
                />
            </div>

            <div className={styles.row}>
                <Input
                    numeric
                    allowDecimal
                    min={0}
                    step={0.1}
                    label="Peso (kg)"
                    name="peso"
                    placeholder="Peso"
                    value={form.peso}
                    onChange={handleChange}
                    required
                />
                <TextField
                    label="Identificación mascota"
                    name="identeficacion_mascota"
                    placeholder="Identificación mascota"
                    value={form.identeficacion_mascota}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.row}>
                <TextField
                    label="Alergias"
                    name="alergias"
                    placeholder="Alergias"
                    value={form.alergias}
                    onChange={handleChange}
                />
                <TextField
                    label="Condiciones médicas"
                    name="condiciones_medicas"
                    placeholder="Condiciones médicas"
                    value={form.condiciones_medicas}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.checkRow}>
                    <Switch
                        value={form.esterilizado}
                        onChange={(newVal) => setForm(prev => ({ ...prev, esterilizado: newVal }))}
                    />
                    <span style={{ userSelect: 'none' }}>Esterilizado</span>
                </div>
            </div>

            {footerNode ? createPortal(actionButtons, footerNode) : <div className={styles.actions}>{actionButtons}</div>}
        </form>
    );
}

export default function CustomerAndPets() {
    const navigate = useNavigate();

    usePanelHeader({
        title: "Crear Cliente y Mascota",
        message: "Registra un nuevo usuario con los detalles de su mascota"
    });

    return (
        <div className={styles.container}>
            <CustomerAndPetsForm onCreated={() => navigate(-1)} onCancel={() => navigate(-1)} />
        </div>
    );
}