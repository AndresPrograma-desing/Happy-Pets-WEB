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
				nombre: String(form.nombre || '').trim(),
				apellido: String(form.apellido || '').trim(),
				email: String(form.email || '').trim(),
				telefono: String(form.telefono || '').trim(),
				direccion: String(form.direccion || '').trim(),
				identificacion: String(form.identificacion || '').trim(),
				nota: String(form.nota || '').trim(),
				mascota: {
					nombre: String(form.mascota_nombre || '').trim(),
					especie: String(form.especie || '').trim(),
					raza: String(form.raza || '').trim(),
					color: String(form.color || '').trim(),
					sexo: String(form.sexo || '').trim(),
					fechaNacimiento: String(form.fecha_nacimiento || '').trim(),
					peso: form.peso === '' ? null : Number(form.peso),
					identeficacionMascota: String(form.identeficacion_mascota || '').trim(),
					alergias: String(form.alergias || '').trim(),
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
