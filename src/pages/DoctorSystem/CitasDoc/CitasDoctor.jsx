import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CitasDoctor.module.css';
import useGetCitas from '../../../hooks/GetCitas';
import { deleteCita, deleteCitaAlt, updateCitaEstado } from '../../../services/api';
import PanelCitas from '../../../components/PanelCitas/PanelCitas';
import AlertModal from '../../../components/AlertModal/AlertModal';
import DrawPanel from '../../../components/screens/components/DrawPanel/index';
import { CustomerAndPetsForm } from '../CreateCustomerAndPets/CustomerAndPets';
import { openNewTab } from '../../../utils/navegation';

import Button from '../../../components/screens/components/Button';

function CitasDoctor() {
	const navigate = useNavigate();
	const { citas, loading, error, refetch } = useGetCitas();
	const [deletingId, setDeletingId] = useState(null);
	const [localError, setLocalError] = useState('');
		const totalCitas = Array.isArray(citas) ? citas.length : 0;
		const [showCreateClientModal, setShowCreateClientModal] = useState(false);
		const [showCreateClientBadReqModal, setShowCreateClientBadReqModal] = useState(false);
		const [showCreateClientSuccessModal, setShowCreateClientSuccessModal] = useState(false);
		const [createClientError, setCreateClientError] = useState(null);

		const openCreateClientModal = () => {
			setCreateClientError(null);
			setShowCreateClientBadReqModal(false);
			setShowCreateClientSuccessModal(false);
			setShowCreateClientModal(true);
		};
		const closeCreateClientModal = () => setShowCreateClientModal(false);
		const closeCreateClientBadReqModal = () => setShowCreateClientBadReqModal(false);
		const closeCreateClientSuccessModal = () => setShowCreateClientSuccessModal(false);

		const handleCreateClientSuccess = () => {
			if (typeof refetch === 'function') refetch();
			setShowCreateClientModal(false);
			setShowCreateClientBadReqModal(false);
			setShowCreateClientSuccessModal(true);
		};

		const handleCreateClientError = (err) => {
			const isBadRequest = err?.status === 400 || err?.response?.status === 400 || /bad request/i.test(err?.message || '');
			setCreateClientError(err || null);
			if (isBadRequest) {
				setShowCreateClientModal(false);
				setShowCreateClientBadReqModal(true);
				return;
			}
		};

	const renderField = (cita, keys) => {
		for (const k of keys) {
			if (cita[k]) {
				let val = cita[k];
				// Normalizar estados específicos del backend
				if (typeof val === 'string' && (k === 'estado' || k === 'status')) {
					const raw = val.trim();
					if (raw === 'en_curso') return 'En curso';
					if (raw === 'no_asistida') return 'No asistida';
					const cleaned = raw.replace(/_/g, ' ').replace(/\bpiso\b/gi, '').trim();
					return cleaned || '—';
				}
				if (val && typeof val === 'object') {
					const nombre = val.nombre || val.name || val.firstName || val.first_name || '';
					const apellido = val.apellido || val.lastName || val.last_name || '';
					const telefono = val.telefono || val.phone || '';
					if (nombre || apellido) return `${String(nombre).trim()} ${String(apellido).trim()}`.trim() || '—';
					if (telefono) return telefono;
					if (val.rol) return String(val.rol);
					if (val.id) return String(val.id);
					return '—';
				}
				return val;
			}
		}
		return '—';
	};

	const formatDate = (iso) => {
		if (!iso) return '—';
		try {
				const d = new Date(iso);
				return d.toLocaleDateString();
			} catch (err) {
				if (import.meta.env.DEV) console.error('formatDate failed', err);
				return iso;
			}
	};

	const formatTime = (time, fallback) => {
		if (time) return time.slice(0,5);
		if (fallback) {
			try {
				const d = new Date(fallback);
				return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
			} catch (err) {
				if (import.meta.env.DEV) console.error('formatTime fallback failed', err);
				return fallback;
			}
		}
		return '—';
	};

	const getCitaId = (cita) => cita?.id ?? cita?._id ?? cita?.ID;

	const handleDelete = async (cita) => {
		const citaId = getCitaId(cita);
		if (!citaId) {
			setLocalError('No se pudo eliminar: la cita no tiene un ID válido.');
			return;
		}

		setPendingDeleteCita({ cita, citaId, paciente: renderField(cita, ['paciente_nombre', 'paciente', 'patient', 'nombre', 'name']) });
		setShowDeleteModal(true);
	};

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [pendingDeleteCita, setPendingDeleteCita] = useState(null);

	const cancelDelete = () => {
		setShowDeleteModal(false);
		setPendingDeleteCita(null);
	};

	const confirmDelete = async () => {
		if (!pendingDeleteCita) return;
		const { citaId } = pendingDeleteCita;

		setDeletingId(citaId);
		setLocalError('');
		setShowDeleteModal(false);

		try {
			try {
				await deleteCita(citaId);
				await refetch();
				return;
			} catch (err) {
				console.warn('delete direct failed, trying alt delete', err);
			}

			try {
				await deleteCitaAlt(citaId);
				await refetch();
				return;
			} catch (errAlt) {
				console.warn('alt delete failed, trying update estado', errAlt);
			}

			try {
				await updateCitaEstado(citaId, 'cancelada');
				await refetch();
			} catch (updateErr) {
				console.error('fallback error', updateErr);
				setLocalError('No se pudo eliminar ni marcar la cita');
			}
		} catch (err) {
			setLocalError(err?.message || 'No se pudo eliminar la cita.');
		} finally {
			setDeletingId(null);
			setPendingDeleteCita(null);
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.hero}>
				<div>
					<p className={styles.kicker}>Agenda clinica</p>
					<h1 className={styles.title}>Citas del Doctor</h1>
					<p className={styles.intro}>Gestiona las citas programadas y empieza consultas desde este panel.</p>
				</div>
				<div style={{ display: 'flex', gap: 8 }}>
					< Button type="button" 
					className={styles.backButton} 
					onClick={() => navigate('/doctor')}>
					
						Volver a la página principal
					</Button >
					<button type="button" className={styles.refreshButton} onClick={() => { console.log('refetch clicked'); refetch(); }}>
						Actualizar
					</button>
					<button type="button" className={styles.refreshButton} onClick={() => openNewTab('/citas/crear?role=doctor')}>
						Crear cita
					</button>
						<button type="button" className={styles.refreshButton} onClick={() => { console.log('openCreateClientModal'); openCreateClientModal(); }}>
						Crear cliente
					</button>
				</div>
			</div>

			<div className={styles.metricsRow}>
				<div className={styles.metricCard}>
					<span className={styles.metricLabel}>Total de citas</span>
					<strong className={styles.metricValue}>{totalCitas}</strong>
				</div>
				<div className={styles.metricCard}>
					<span className={styles.metricLabel}>Estado del panel</span>
					<strong className={styles.metricValue}>{loading ? 'Cargando' : 'Listo'}</strong>
				</div>
			</div>

			{error && (
				<div className={styles.errorBanner}>
					Error al cargar citas: {error.message || String(error)}{' '}
					<button className={styles.retryButton} onClick={refetch}>Reintentar</button>
				</div>
			)}

			{!!localError && <div className={styles.errorText}>{localError}</div>}

			<div className={styles.contentWrap}>
					<PanelCitas
						citas={citas}
						loading={loading}
						deletingId={deletingId}
						renderField={renderField}
						formatDate={formatDate}
						formatTime={formatTime}
						getCitaId={getCitaId}
						onDelete={handleDelete}
					/>
			</div>

			<AlertModal
				open={showDeleteModal}
				title="¿Desea eliminar esta cita?"
				message={pendingDeleteCita ? `Confirme que desea eliminar la cita de ${pendingDeleteCita.paciente}.` : 'Confirme la eliminación.'}
				onClose={cancelDelete}
				onConfirm={confirmDelete}
				confirmText="Eliminar"
				cancelText="Cancelar"
			/>

			<DrawPanel
				isOpen={showCreateClientModal}
				title="Crear cliente y mascota"
				onClose={closeCreateClientModal}
				width="600px"
				showActions={false}
			>
				<CustomerAndPetsForm onCreated={handleCreateClientSuccess} onCancel={closeCreateClientModal} onError={handleCreateClientError} />
			</DrawPanel>

			<AlertModal
				open={showCreateClientBadReqModal}
				title="No se pudo completar el registro."
				message={createClientError || 'Verifique los datos del cliente y la mascota, e intente nuevamente.'}
				onClose={closeCreateClientBadReqModal}
				cancelText="Cerrar"
			/>

			<AlertModal
				open={showCreateClientSuccessModal}
				title="Cliente y mascota creados"
				message="El cliente y su mascota se crearon correctamente"
				onClose={closeCreateClientSuccessModal}
				cancelText="Cerrar"
			/>
		</div>
	);
}

export default CitasDoctor;

