
// Guarda el id del usuario logueado
export function setUserId(id) {
	if (!id) return;
	localStorage.setItem('user_id', id);
	sessionStorage.setItem('user_id', id);
}

// Obtiene el id del usuario logueado
export function getUserId() {
	// Prioriza sessionStorage para evitar IDs viejos de otra sesión/pestaña.
	return sessionStorage.getItem('user_id') || localStorage.getItem('user_id') || null;
}
