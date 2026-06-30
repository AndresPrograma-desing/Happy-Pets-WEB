export const INITIAL_PET_FORM = {
  nombre: '',
  especie: '',
  raza: '',
  color: '',
  sexo: '',
  fechaNacimiento: '',
  peso: '',
  identeficacionMascota: '',
  alergias: '',
  condicionesMedicas: '',
  esterilizado: false
};

export const handleFormChange = (e, setPetForm) => {
  const { name, value, type, checked } = e.target;
  setPetForm(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

export const preparePetPayload = (clienteId, form) => {
  return {
    clienteId: Number(clienteId),
    nombre: form.nombre.trim(),
    especie: form.especie.trim(),
    raza: form.raza.trim(),
    color: form.color.trim(),
    sexo: form.sexo.trim(),
    fechaNacimiento: form.fechaNacimiento || null,
    peso: form.peso ? Number(form.peso) : 0,
    identeficacionMascota: form.identeficacionMascota.trim(),
    alergias: form.alergias.trim() || 'Ninguna',
    condicionesMedicas: form.condicionesMedicas.trim() || 'Sano',
    esterilizado: Boolean(form.esterilizado)
  };
};