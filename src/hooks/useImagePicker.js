import { useEffect, useRef, useState } from 'react';

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function useImagePicker(file, setFile) {
	const inputRef = useRef(null);
	const [preview, setPreview] = useState(undefined);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!file) {
			setPreview(undefined);
			return undefined;
		}
		const url = URL.createObjectURL(file);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	const openPicker = () => inputRef.current?.click();

	const handleSelect = (e) => {
		const selected = e.target.files?.[0];
		e.target.value = '';
		if (!selected) return;

		if (!IMAGE_ALLOWED_TYPES.includes(selected.type)) {
			setError('Formato no soportado. Use JPG, PNG, WEBP o GIF.');
			return;
		}
		if (selected.size > IMAGE_MAX_SIZE) {
			setError('La imagen supera el tamaño máximo de 5 MB.');
			return;
		}
		setError('');
		setFile(selected);
	};

	const clear = () => {
		setError('');
		setFile(null);
	};

	return { inputRef, preview, error, openPicker, handleSelect, clear };
}
