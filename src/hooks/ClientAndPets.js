import { useState } from 'react';
import { createClienteMascota, uploadClientImage, uploadPetImage } from '../services/api';
import { buildCedula } from '../utils/validation';

export default function useClientAndPets() {
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState(null);

	const createClientAndPet = async (form, { clientImage = null, petImage = null } = {}) => {
		setError(null);
		setCreating(true);
		try {
			const payload = {
				nombre: String(form.nombre || '').trim(),
				apellido: String(form.apellido || '').trim(),
				email: String(form.email || '').trim(),
				telefono: String(form.telefono || '').trim(),
				direccion: String(form.direccion || '').trim(),
				identificacion: buildCedula(form.tipo_cedula, form.identificacion),
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

			const failed = [];
			if (clientImage) {
				try { await uploadClientImage(res.clienteId, clientImage); } catch { failed.push('del cliente'); }
			}
			if (petImage) {
				try { await uploadPetImage(res.mascotaId, petImage); } catch { failed.push('de la mascota'); }
			}

			setCreating(false);
			return failed.length > 0
				? { ...res, imageWarning: `Se registró el cliente, pero no se pudo subir la imagen ${failed.join(' ni la imagen ')}.` }
				: res;
		} catch (err) {
			setError(err);
			setCreating(false);
			throw err;
		}
	};

	return { creating, error, createClientAndPet };
}
