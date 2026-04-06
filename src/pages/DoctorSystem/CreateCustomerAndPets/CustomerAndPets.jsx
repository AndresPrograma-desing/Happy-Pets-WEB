import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useClientAndPets from '../../../hooks/ClientAndPets';
import styles from './CustumerAndPets.module.css';


const initialForm = {
	nombre: '',
	apellido: '',
	email: '',
	telefono: '',
	direccion: '',
	identificacion: '',
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

export function CustomerAndPetsForm({ onCreated, onCancel, onError, submitting: submittingProp, serverError }) {
	const [form, setForm] = useState(initialForm);
	const [localError, setLocalError] = useState('');
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
		setLocalError('');
		try {
			const created = await createClientAndPet(form);
			if (typeof onCreated === 'function') onCreated(created);
			setForm(initialForm);
		} catch (err) {
			const isConflict = err?.status === 409 || /conflict/i.test(String(err?.body?.message || err?.message || ''));
			const message = isConflict
				? 'Ya existe un usuario con los mismos datos.'
				: (err?.body?.message || err?.message || 'No se pudo crear el cliente con su mascota');
			setLocalError(message);
			if (typeof onError === 'function') onError(err);
		}
	};

	const isSubmitting = creating || submittingProp;

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			{(localError || serverError) && <div className={styles.error}>{localError || serverError}</div>}

			<h3 className={styles.sectionTitle}>Datos del cliente</h3>
			<div className={styles.row}>
				<input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
				<input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} required />
			</div>
			<div className={styles.row}>
				<input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
				<input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
			</div>
			<div className={styles.row}>
				<input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
				<input name="identificacion" placeholder="Identificación" value={form.identificacion} onChange={handleChange} required />
			</div>

			<h3 className={styles.sectionTitle}>Datos de la mascota</h3>
			<div className={styles.row}>
				<input name="mascota_nombre" placeholder="Nombre de mascota" value={form.mascota_nombre} onChange={handleChange} required />
				<input name="especie" placeholder="Especie" value={form.especie} onChange={handleChange} required />
			</div>
			<div className={styles.row}>
				<input name="raza" placeholder="Raza" value={form.raza} onChange={handleChange} required />
				<input name="color" placeholder="Color" value={form.color} onChange={handleChange} required />
			</div>
			<div className={styles.row}>
				<input name="sexo" placeholder="Sexo" value={form.sexo} onChange={handleChange} required />
				<input name="fecha_nacimiento" type="date" placeholder="Fecha de nacimiento" value={form.fecha_nacimiento} onChange={handleChange} required />
			</div>
			<div className={styles.row}>
				<input name="peso" type="number" step="0.1" placeholder="Peso" value={form.peso} onChange={handleChange} required />
				<input name="identeficacion_mascota" placeholder="Identificación mascota" value={form.identeficacion_mascota} onChange={handleChange} required />
			</div>
			<div className={styles.row}>
				<input name="alergias" placeholder="Alergias" value={form.alergias} onChange={handleChange} />
				<input name="condiciones_medicas" placeholder="Condiciones médicas" value={form.condiciones_medicas} onChange={handleChange} />
			</div>
			<div className={styles.row}>
				<label className={styles.checkRow}>
					<input name="esterilizado" type="checkbox" checked={form.esterilizado} onChange={handleChange} />
					Esterilizado
				</label>
			</div>

			<div className={styles.actions}>
				<button type="submit" className={styles.primary} disabled={isSubmitting}>
					{isSubmitting ? 'Guardando registro...' : 'Crear Cliente y Mascota'}
				</button>
				{typeof onCancel === 'function' && (
					<button type="button" className={styles.secondary} onClick={onCancel}>
						Cancelar
					</button>
				)}
			</div>
		</form>
	);
}

export default function CustomerAndPets() {
	const navigate = useNavigate();

	return (
		<div className={styles.container}>
			<h2 className={styles.title}>Crear Cliente y Mascota</h2>
			<CustomerAndPetsForm onCreated={() => navigate(-1)} />
		</div>
	);
}
