import { useState } from 'react';
import { createClienteMascota } from '../services/api';

export default function useClientAndPets() {
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState(null);

	const createClientAndPet = async (form) => {
		setError(null);
		setCreating(true);
		try {
			const payload = {
				cliente: {
					nombre: form.nombre,
					apellido: form.apellido,
					email: form.email,
					telefono: form.telefono,
					direccion: form.direccion,
					identificacion: form.identificacion,
				},
				mascota: {
					nombre: form.mascota_nombre,
					especie: form.especie,
					raza: form.raza,
					color: form.color,
					sexo: form.sexo,
					fecha_nacimiento: form.fecha_nacimiento,
					peso: form.peso === '' ? null : Number(form.peso),
					identeficacion_mascota: form.identeficacion_mascota,
					alergias: form.alergias,
					condiciones_medicas: form.condiciones_medicas,
					esterilizado: Boolean(form.esterilizado),
				},
			};

			const res = await createClienteMascota(payload);
			setCreating(false);
			return res;
		} catch (err) {
			setError(err);
			setCreating(false);
			throw err;
		}
	};

	return { creating, error, createClientAndPet };
}
