import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AlertModal from '../../../components/AlertModal/AlertModal';
import { createCita, createCliente, getDoctorIdFromLoginSession, getMascotasByUserName, getUserNameFromLoginSession, getUsers, getSecretarias, getToken } from '../../../services/api';
import styles from './CreatedCita.module.css';
import { useSearchParams } from 'react-router-dom';	
function extractDoctorIdFromToken() {
	try {
		const token = getToken();
		if (!token) return '';
		const parts = token.split('.');
		if (parts.length < 2) return '';
		const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
		const payload = JSON.parse(atob(padded));
		return (
			payload?.doctor_id ??
			payload?.doctorId ??
			payload?.user?.doctor_id ??
			payload?.user?.doctorId ??
			payload?.user_id ??
			payload?.id ??
			payload?.sub ??
			''
		);
	} catch (err) {
		if (import.meta.env.DEV) console.error('extractDoctorIdFromToken failed', err);
		return '';
	}
}

function normalizeCliente(item) {
	const id = item?.id ?? item?._id ?? item?.ID ?? item?.cliente_id;
	const nombre = item?.nombre ?? '';
	const apellido = item?.apellido ?? '';
	const mascotaId = item?.mascota_id ?? item?.Mascotum?.id ?? item?.mascota?.id ?? '';
	const mascotaNombre = item?.Mascotum?.nombre ?? item?.mascota?.nombre ?? item?.nombre_mascota ?? '';
	return {
		...item,
		id,
		nombre,
		apellido,
		fullName: `${nombre} ${apellido}`.trim(),
		mascotaId,
		mascotaNombre,
	};
}

function normalizeUserMascotaResults(raw, fallbackName = '') {
	const list = Array.isArray(raw)
		? raw
		: raw?.data || raw?.items || raw?.rows || raw?.mascotas || [];

	const result = [];

	list.forEach((item) => {
		// Caso A: item es mascota con referencias a usuario/cliente
		const user = item?.user || item?.usuario || item?.cliente || item?.Cliente || item?.owner || item?.propietario || {};
		const mascotaIdA = item?.id ?? item?._id ?? item?.ID ?? item?.mascota_id ?? '';
		const mascotaNombreA = item?.nombre_mascota || item?.mascota?.nombre || item?.pet_name || item?.nombre || '';
		const nombreA = user?.nombre || item?.nombre_usuario || '';
		const apellidoA = user?.apellido || item?.apellido_usuario || '';
		const fullNameA = `${nombreA} ${apellidoA}`.trim() || String(fallbackName || '').trim();
		if (mascotaIdA && fullNameA) {
			result.push({
				id: user?.id ?? user?._id ?? user?.ID ?? item?.usuario_id ?? item?.cliente_id ?? fullNameA,
				nombre: nombreA || fullNameA,
				apellido: apellidoA || '',
				fullName: fullNameA,
				mascotaId: mascotaIdA,
				mascotaNombre: mascotaNombreA || `Mascota ${mascotaIdA}`,
			});
		}

		// Caso B: item es usuario con arreglo de mascotas
		const userIdB = item?.id ?? item?._id ?? item?.ID ?? item?.usuario_id ?? '';
		const nombreB = item?.nombre || item?.name || '';
		const apellidoB = item?.apellido || item?.last_name || '';
		const fullNameB = `${nombreB} ${apellidoB}`.trim();
		const mascotasB = Array.isArray(item?.mascotas) ? item.mascotas : [];
		mascotasB.forEach((m) => {
			const mascotaIdB = m?.id ?? m?._id ?? m?.ID ?? m?.mascota_id ?? '';
			if (mascotaIdB && fullNameB) {
				result.push({
					id: userIdB || fullNameB,
					nombre: nombreB,
					apellido: apellidoB,
					fullName: fullNameB,
					mascotaId: mascotaIdB,
					mascotaNombre: m?.nombre || m?.name || `Mascota ${mascotaIdB}`,
				});
			}
		});
	});

	// Deduplicar por usuario + mascota
	const map = new Map();
	result.forEach((r) => {
		const key = `${r.id}-${r.mascotaId}`;
		if (!map.has(key)) map.set(key, r);
	});

	return Array.from(map.values());
}

export default function CreatedCita() {
	const navigate = useNavigate();
	const location = useLocation();
	const [clienteMode, setClienteMode] = useState('existente');
	const [clientes, setClientes] = useState([]);
	const [query, setQuery] = useState('');
	const [selectedCliente, setSelectedCliente] = useState(null);
	const [newCliente, setNewCliente] = useState({
		nombre: '',
		apellido: '',
		email: '',
		telefono: '',
		direccion: '',
		identificacion: '',
	});

	const [form, setForm] = useState({
		mascota_id: '',
		doctor_id: '',
		secretaria_id: '',
		fecha_cita: '',
		hora_cita: '',
		motivo: '',
		tipo_cita: 'consulta general',
		estado: 'programada',
		notas: '',
		metodo_pago: 'efectivo',
	});

	const [submitting, setSubmitting] = useState(false);
	const [loadingDoctor, setLoadingDoctor] = useState(true);
	const [error, setError] = useState('');
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [lookupLoading, setLookupLoading] = useState(false);
	const [doctorName, setDoctorName] = useState('');
	const [secretariaName, setSecretariaName] = useState('');
	const [mascotaDisplayName, setMascotaDisplayName] = useState('');

	useEffect(() => {
		setLoadingDoctor(true);
		const doctorId = getDoctorIdFromLoginSession() || extractDoctorIdFromToken();
		const nameFromSession = getUserNameFromLoginSession();
		if (nameFromSession) setDoctorName(nameFromSession);

		if (!doctorId) {
			setError('No se pudo obtener el doctor_id desde auth/login. Inicia sesión nuevamente.');
			setLoadingDoctor(false);
			return;
		}

		setForm((prev) => ({ ...prev, doctor_id: String(doctorId) }));
		setLoadingDoctor(false);
	}, []);

	useEffect(() => {
		let cancelled = false;
		const loadNames = async () => {
			try {
				const data = await getUsers();
				const list = Array.isArray(data) ? data : data?.data || data?.items || data?.rows || [];
				const users = list.map((u) => {
					const id = u?.id ?? u?._id ?? u?.ID ?? u?.user_id;
					const nombre = u?.nombre ?? u?.name ?? '';
					const apellido = u?.apellido ?? u?.last_name ?? '';
					return { id, fullName: `${nombre} ${apellido}`.trim() || String(nombre || '') };
				});

				if (cancelled) return;

				const doctor = users.find((u) => String(u.id) === String(form.doctor_id));
				const secretaria = users.find((u) => String(u.id) === String(form.secretaria_id));

				if (doctor?.fullName) setDoctorName(doctor.fullName);
				if (secretaria?.fullName) setSecretariaName(secretaria.fullName);
			} catch (err) {
				if (import.meta.env.DEV) console.error('loadNames failed', err);
				// keep fallback labels
			}
		};

		if (form.doctor_id) loadNames();
		return () => {
			cancelled = true;
		};
	}, [form.doctor_id, form.secretaria_id]);

	// Obtener secretaria por API (no usar id estático)
	useEffect(() => {
		let cancelled = false;
		const loadSecretarias = async () => {
			try {
				const res = await getSecretarias();
				const list = Array.isArray(res) ? res : res?.data || res?.items || res?.rows || res?.secretarias || [];
				if (cancelled) return;
				if (list.length) {
					const first = list[0];
					const id = first?.id ?? first?._id ?? first?.ID ?? first?.secretaria_id ?? '';
					setForm((prev) => ({ ...prev, secretaria_id: String(id) }));
					const nombre = (first?.nombre || first?.name || first?.fullName || first?.usuario_nombre) || '';
					if (nombre) setSecretariaName(nombre);
				}
			} catch (e) {
				console.error('Error loading secretarias:', e);
			}
		};
		if (form.doctor_id) loadSecretarias();
		return () => { cancelled = true; };
	}, [form.doctor_id]);

	const filteredClientes = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return clientes.filter((c) => c.fullName.toLowerCase().includes(q)).slice(0, 8);
	}, [clientes, query]);

	useEffect(() => {
		if (clienteMode !== 'existente') return;
		const name = query.trim();
		if (name.length < 2) {
			setClientes([]);
			return;
		}

		let cancelled = false;
		const t = setTimeout(async () => {
			try {
				setLookupLoading(true);
				const res = await getMascotasByUserName(name);
				if (cancelled) return;
				setClientes(normalizeUserMascotaResults(res, name));
			} catch (err) {
				if (!cancelled) setError(err?.message || 'No se pudieron cargar usuarios por nombre');
			} finally {
				if (!cancelled) {
					setLookupLoading(false);
				}
			}
		}, 250);

		return () => {
			cancelled = true;
			clearTimeout(t);
		};
	}, [query, clienteMode]);

	const handleSelectCliente = (cliente) => {
		setSelectedCliente(cliente);
		setQuery(cliente.fullName);
		setMascotaDisplayName(cliente.mascotaNombre || `Mascota ${cliente.mascotaId}`);
		setForm((prev) => ({ ...prev, mascota_id: cliente.mascotaId || cliente.id || prev.mascota_id }));
	};

	const handleCreateAndUseCliente = async () => {
		try {
			setError('');
			const created = await createCliente(newCliente);
			const createdNorm = normalizeCliente(created?.data || created);
			setSelectedCliente(createdNorm);
			setQuery(createdNorm.fullName || newCliente.nombre);
			setMascotaDisplayName(createdNorm.mascotaNombre || (createdNorm.mascotaId ? `Mascota ${createdNorm.mascotaId}` : ''));
			setForm((prev) => ({ ...prev, mascota_id: createdNorm.mascotaId || createdNorm.id || prev.mascota_id }));
		} catch (err) {
			setError(err?.message || 'No se pudo crear el cliente nuevo');
		}
	};

	const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	const handleNewClienteChange = (e) => setNewCliente((prev) => ({ ...prev, [e.target.name]: e.target.value }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError('');
		setShowErrorModal(false);
		try {
			if (!form.doctor_id) {
				throw new Error('Doctor ID no disponible en la sesión actual.');
			}

			// Validaciones cliente-side: asegurar mascota y campos obligatorios
			if (!form.mascota_id) {
				setError('Seleccione un cliente y mascota antes de crear la cita.');
				setShowErrorModal(true);
				return;
			}

			// Estado fijo por requisito de negocio: programada.
			const normalizedEstado = 'programada';

			const payload = {
				mascota_id: Number(form.mascota_id),
				doctor_id: Number(form.doctor_id),
				secretaria_id: Number(form.secretaria_id) || null,
				fecha_cita: form.fecha_cita,
				hora_cita: form.hora_cita,
				motivo: form.motivo,
				tipo_cita: form.tipo_cita,
				estado: normalizedEstado,
				notas: form.notas,
				metodo_pago: String(form.metodo_pago || 'efectivo'),
			};
			await createCita(payload);
			// limpiar errores previos y mostrar modal de éxito
			setError('');
			setShowErrorModal(false);
			setShowSuccessModal(true);
		} catch (err) {
			const msg = err?.message || 'No se pudo crear la cita';
			setError(msg);
			setShowErrorModal(true);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<div className={styles.headerText}>
					<h2 className={styles.title}>Crear Cita</h2>
					<p className={styles.subtitle}>Selecciona cliente existente o crea uno nuevo antes de registrar la cita.</p>
				</div>
				<div className={styles.headerActions}>
					<button type="button" className={styles.tertiary} onClick={() => navigate('/citas', { state: { role: location.state?.role ?? 'doctor' } })}>
						Volver a citas
					</button>
				</div>
			</div>

			<form className={styles.card} onSubmit={handleSubmit}>
				{error && <div className={styles.error}>{error}</div>}

				<div className={styles.segment}>
					<button type="button" className={clienteMode === 'existente' ? styles.active : ''} onClick={() => setClienteMode('existente')}>
						Cliente existente
					</button>
					<button type="button" className={clienteMode === 'nuevo' ? styles.active : ''} onClick={() => setClienteMode('nuevo')}>
						Cliente nuevo
					</button>
				</div>

				{clienteMode === 'existente' ? (
					<div className={styles.group}>
						<label className={styles.label}>Buscar cliente por nombre</label>
						<div className={styles.searchWrap}>
							<input
								className={styles.input}
								placeholder={lookupLoading ? 'Buscando usuario...' : 'Escriba al menos 2 letras del nombre'}
								value={query}
								onChange={(e) => {
									setQuery(e.target.value);
									setSelectedCliente(null);
								}}
							/>
							{filteredClientes.length > 0 && (
								<div className={styles.searchList}>
									{filteredClientes.map((c) => (
										<div key={`${c.id}-${c.mascotaId}`} className={styles.searchItem} onClick={() => handleSelectCliente(c)}>
											{c.fullName || c.nombre} - Mascota: {c.mascotaNombre || `Mascota ${c.mascotaId}`}
										</div>
									))}
								</div>
							)}
						</div>
						{selectedCliente && (
							<div className={styles.inlineInfo}>
								Cliente seleccionado: {selectedCliente.fullName || selectedCliente.nombre}
							</div>
						)}
					</div>
				) : (
					<>
						<div className={styles.row}>
							<div className={styles.group}>
								<label className={styles.label}>Nombre</label>
								<input className={styles.input} name="nombre" value={newCliente.nombre} onChange={handleNewClienteChange} />
							</div>
							<div className={styles.group}>
								<label className={styles.label}>Apellido</label>
								<input className={styles.input} name="apellido" value={newCliente.apellido} onChange={handleNewClienteChange} />
							</div>
						</div>
						<div className={styles.rowThree}>
							<div className={styles.group}>
								<label className={styles.label}>Email</label>
								<input className={styles.input} name="email" value={newCliente.email} onChange={handleNewClienteChange} />
							</div>
							<div className={styles.group}>
								<label className={styles.label}>Teléfono</label>
								<input className={styles.input} name="telefono" value={newCliente.telefono} onChange={handleNewClienteChange} />
							</div>
							<div className={styles.group}>
								<label className={styles.label}>Identificación</label>
								<input className={styles.input} name="identificacion" value={newCliente.identificacion} onChange={handleNewClienteChange} />
							</div>
						</div>
						<div className={styles.group}>
							<label className={styles.label}>Dirección</label>
							<input className={styles.input} name="direccion" value={newCliente.direccion} onChange={handleNewClienteChange} />
						</div>
						<div className={styles.actions}>
							<button type="button" className={styles.secondary} onClick={handleCreateAndUseCliente}>Crear y usar cliente</button>
						</div>
					</>
				)}

				<div className={styles.rowThree}>
					<div className={styles.group}>
						<label className={styles.label}>Mascota</label>
						<input
							className={styles.input}
							value={mascotaDisplayName || (form.mascota_id ? `Mascota ${form.mascota_id}` : '')}
							readOnly
							placeholder="Seleccione un cliente para asociar mascota"
						/>
					</div>
					<div className={styles.group}>
						<label className={styles.label}>Doctor</label>
						<input
							className={styles.input}
							value={doctorName || (form.doctor_id ? `Doctor ${form.doctor_id}` : '')}
							readOnly
							placeholder={loadingDoctor ? 'Cargando doctor...' : 'Doctor cargado de sesión'}
						/>
					</div>
					<div className={styles.group}>
						<label className={styles.label}>Secretaria</label>
						<input className={styles.input} value={secretariaName || `Secretaria ${form.secretaria_id}`} readOnly />
					</div>
				</div>

				<div className={styles.row}>
					<div className={styles.group}>
						<label className={styles.label}>Fecha de cita</label>
						<input className={styles.input} type="date" name="fecha_cita" value={form.fecha_cita} onChange={handleChange} required />
					</div>
					<div className={styles.group}>
						<label className={styles.label}>Hora de cita</label>
						<input className={styles.input} type="time" name="hora_cita" value={form.hora_cita} onChange={handleChange} required />
					</div>
				</div>

				<div className={styles.row}>
					<div className={styles.group}>
						<label className={styles.label}>Tipo de cita</label>
						<input className={styles.input} name="tipo_cita" value={form.tipo_cita} onChange={handleChange} required />
					</div>
					<div className={styles.group}>
						<label className={styles.label}>Motivo</label>
						<input className={styles.input} name="motivo" value={form.motivo} onChange={handleChange} required />
					</div>
				</div>

				<div className={styles.group}>
					<label className={styles.label}>Notas</label>
					<textarea className={styles.textarea} name="notas" value={form.notas} onChange={handleChange} />
				</div>

				<div className={styles.group}>
					<label className={styles.label}>Método de pago</label>
					<select className={styles.input} name="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
						<option value="efectivo">Efectivo</option>
						<option value="no definido">No definido</option>
						<option value="transferencia">Transferencia</option>
						<option value="pago movil">Pago movil</option>
					</select>
				</div>

				<div className={styles.actions}>
					<button type="button" className={styles.secondary} onClick={() => navigate(-1)}>Cancelar</button>
					<button type="submit" className={styles.primary} disabled={submitting}>{submitting ? 'Creando...' : 'Crear cita'}</button>
				</div>
			</form>

			<AlertModal
				open={showSuccessModal}
				title="Cita creada"
				message="La cita fue creada correctamente"
				onClose={() => {
					setShowSuccessModal(false);
					navigate('/citas', { state: { role: location.state?.role ?? 'doctor' } });
				}}
				cancelText="Cerrar"
			/>

			<AlertModal
				open={showErrorModal}
				title="Error al crear cita"
				message={error}
				onClose={() => setShowErrorModal(false)}
				cancelText="Cerrar"
			/>
		</div>
	);
}
