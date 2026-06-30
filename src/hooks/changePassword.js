
import { useState } from 'react';
import api from '../services/api';

/**
 * Hook para cambiar la contraseña de un usuario.
 * @returns {{changePassword: function, loading: boolean, error: string|null, success: boolean}}
 */
export default function useChangePassword() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	/**
	 * Cambia la contraseña del usuario
	 * @param {string} userEmail
	 * @param {string} oldPassword
	 * @param {string} newPassword
	 * @returns {Promise<boolean>}
	 */
	const changePassword = async (userEmail, oldPassword, newPassword) => {
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			const email = String(userEmail || '').trim();
			const lastPass = String(oldPassword || '').trim();
			const password = String(newPassword || '').trim();

			await api.request('/auth/update-password', {
				method: 'POST',
				body: {
					email,
					oldPassword: lastPass,
					newPassword: password,
				},
			});

			setSuccess(true);
			return true;
		} catch (err) {
			setError(err?.message || 'Error al cambiar la contraseña');
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { changePassword, loading, error, success };
}
