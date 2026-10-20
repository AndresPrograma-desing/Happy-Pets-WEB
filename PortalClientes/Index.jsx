import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DrawPanel, Selector, Input, MultilinePlaceholder, Container, CalendarPicker, HoursPicker, TableA } from 'anteriority-ui';
import styles from './Index.module.css';

// Reusing existing components per your instructions
// import Container from '../src/components/screens/components/Container/index';
import Button from '../src/components/screens/components/Button/index';
import Barnner from '../src/components/screens/components/Barnner';
import Loading from '../src/components/screens/components/Loading/Index';
import ContactsPanel from './Components/ContactsPanel/Index.jsx';
import AsistentChat from './Components/AsistentChat/Index.jsx';
import ClientLogin from './Components/ClientLogin/index.jsx';
import PetAvatarCell from './Components/PetAvatarCell/Index.jsx';

// Icons
import { PawPrint, Calendar, FileText, BookUser } from 'lucide-react';

// Texts
import { TEXT_PORTAL } from './Constants';

// API and utilities
import api from '../src/services/api/index';
import { uploadMyClientImage } from '../src/services/api';
import useImagePicker from '../src/hooks/useImagePicker';
import ClientPanel from './Components/ClientsPanel/ClientPanel.jsx';
import { getClientSessionData, clientLogout } from '../src/services/api/storage';
import { isDummyModeActive } from '../config/config';
import { calculateAge, formatDate, formatHour } from './utils';

export default function PortalClientes() {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  // Sesión y datos del cliente autenticado
  const [session, setSession] = useState(null); // { id, nombre, apellido, email }
  const [mascotas, setMascotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [activeTab, setActiveTab] = useState('pets'); // 'pets', 'appointments', 'recipes'
  const [dataError, setDataError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [notifications, setNotifications] = useState([]);

  // Cancelar cita
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelMotivo, setCancelMotivo] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Confirmar asistencia a cita (desde notificación)
  const [confirmCitaTarget, setConfirmCitaTarget] = useState(null);
  const [confirmCitaMensaje, setConfirmCitaMensaje] = useState('');
  const [confirmCitaLoading, setConfirmCitaLoading] = useState(false);
  const [confirmCitaError, setConfirmCitaError] = useState('');

  // Solicitar cita nueva
  const [showRequestCita, setShowRequestCita] = useState(false);
  const [reqMascotaId, setReqMascotaId] = useState('');
  const [reqMotivo, setReqMotivo] = useState('');
  const [reqFecha, setReqFecha] = useState('');
  const [reqHora, setReqHora] = useState('');
  const [requestCitaLoading, setRequestCitaLoading] = useState(false);
  const [requestCitaError, setRequestCitaError] = useState('');

  // Solicitar renovación de receta
  const [renewTarget, setRenewTarget] = useState(null);
  const [renewNota, setRenewNota] = useState('');
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewError, setRenewError] = useState('');

  // Foto de perfil del cliente autenticado
  const [clientImage, setClientImage] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const {
    inputRef: clientAvatarInputRef,
    preview: clientAvatarPreview,
    openPicker: openClientAvatarPicker,
    handleSelect: handleClientAvatarSelect,
    clear: clearClientAvatarPicker
  } = useImagePicker(clientImage, setClientImage);

  useEffect(() => {
    if (!clientImage) return;
    let active = true;
    (async () => {
      setUploadingAvatar(true);
      try {
        const res = await uploadMyClientImage(clientImage);
        if (active && res?.image_url) {
          setSession(prev => prev ? { ...prev, image_url: res.image_url } : prev);
        }
      } catch (err) {
        if (active) setDataError(err?.message || 'No se pudo subir la foto de perfil.');
      } finally {
        if (active) {
          setUploadingAvatar(false);
          clearClientAvatarPicker();
        }
      }
    })();
    return () => { active = false; };
  }, [clientImage, clearClientAvatarPicker]);

  const clientMenuItems = [
    {
      id: 'pets',
      label: 'Mis Mascotas',
      icon: PawPrint
    },
    {
      id: 'appointments',
      label: 'Mis Citas',
      icon: Calendar
    },
    {
      id: 'recipes',
      label: 'Mis Recetas',
      icon: FileText
    }
  ];

  const handleLogout = () => {
    clientLogout();
    setSession(null);
    setMascotas([]);
    setCitas([]);
    setRecetas([]);
    setActiveTab('pets');
    setDataError('');
    navigate('/portal-cliente');
  };

  // Única fuente de datos del portal: usa la sesión del cliente autenticado (token propio)
  // para traer su perfil, mascotas, citas y recetas desde /ClientAuth/me*.
  const loadPortalData = async () => {
    const profile = await api.getClientMe();
    if (!profile || !profile.id) {
      throw new Error(TEXT_PORTAL.security.errorMessage);
    }

    const clientMascotas = await api.getClientMeMascotas();
    const petsList = Array.isArray(clientMascotas) ? clientMascotas : (clientMascotas?.data ?? clientMascotas?.result ?? []);

    let detailedMascotas = [];
    let gatheredRecetas = [];

    if (petsList && petsList.length > 0) {
      const historyPromises = petsList.map(pet =>
        api.getClientMeHistorial(pet.id).catch(err => {
          console.error(`Error loading history for pet ${pet.id}:`, err);
          return null;
        })
      );
      const histories = await Promise.all(historyPromises);

      petsList.forEach((pet, idx) => {
        const h = histories[idx];
        const petObj = {
          id: pet.id,
          nombre: pet.nombre,
          especie: pet.especie || '—',
          raza: pet.raza || '—',
          fechaNacimiento: pet.fecha_nacimiento || null,
          color: pet.color || '—',
          imageUrl: pet.image_url || null
        };
        detailedMascotas.push(petObj);

        if (h?.consultas) {
          h.consultas.forEach(c => {
            if (c.receta && c.receta.trim() !== '') {
              gatheredRecetas.push({
                id: c.id,
                fecha: c.fecha_consulta || c.createdAt,
                mascota: petObj.nombre,
                doctor: c.doctor_nombre,
                prescripcion: c.receta,
                urlDocx: c.url_docx
              });
            }
          });
        }
      });
    }

    let gatheredCitas = [];
    try {
      const citasResponse = await api.getClientMeCitas();
      const rawCitas = Array.isArray(citasResponse) ? citasResponse : (citasResponse?.data ?? citasResponse?.result ?? []);
      gatheredCitas = rawCitas.map(app => ({
        id: app.id,
        mascota: app.mascota_name || 'Mascota',
        fecha: app.fecha_cita,
        hora: app.hora_cita,
        motivo: app.motivo,
        estado: app.estado
      }));
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }

    let gatheredNotifications = [];
    try {
      const notifsResponse = await api.getClientMeNotifications();
      gatheredNotifications = Array.isArray(notifsResponse) ? notifsResponse : (notifsResponse?.data ?? notifsResponse?.result ?? []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }

    setMascotas(detailedMascotas);
    setCitas(gatheredCitas);
    setRecetas(gatheredRecetas);
    setNotifications(gatheredNotifications);
    setSession(profile);

    return profile;
  };

  useEffect(() => {
    const checkCachedClient = async () => {
      try {
        const cached = getClientSessionData();
        if (cached?.id) {
          await loadPortalData();
        }
      } catch (err) {
        console.error('Error loading client session from cache:', err);
        clientLogout();
      } finally {
        setInitialLoading(false);
      }
    };
    checkCachedClient();
  }, []);

  // Fetch updated data when switching tabs for real-time syncing
  useEffect(() => {
    if (session) {
      loadPortalData().catch(err => {
        console.error('Error refreshing portal data on tab change:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const CANCELLABLE_STATES = ['pendiente', 'programada'];

  const handleOpenCancel = (cita) => {
    setCancelTarget(cita);
    setCancelMotivo('');
    setCancelError('');
  };

  const handleCloseCancel = () => {
    setCancelTarget(null);
    setCancelMotivo('');
    setCancelError('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelMotivo.trim()) {
      setCancelError('El motivo es requerido.');
      return;
    }
    setCancelLoading(true);
    setCancelError('');
    try {
      await api.cancelClientCita(cancelTarget.id, cancelMotivo.trim());
      if (cancelTarget.__notificationId) {
        await api.markClientNotificationAsRead(cancelTarget.__notificationId).catch(() => {});
      }
      setActionSuccess('Cita cancelada con éxito. Se notificó a la clínica.');
      handleCloseCancel();
      await loadPortalData();
    } catch (err) {
      setCancelError(err?.message || 'No se pudo cancelar la cita.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Confirmar asistencia (desde notificación de cita creada por el doctor)
  const handleOpenConfirmCita = (cita) => {
    setConfirmCitaTarget(cita);
    setConfirmCitaMensaje('');
    setConfirmCitaError('');
  };

  const handleCloseConfirmCita = () => {
    setConfirmCitaTarget(null);
    setConfirmCitaMensaje('');
    setConfirmCitaError('');
  };

  const handleConfirmConfirmCita = async () => {
    setConfirmCitaLoading(true);
    setConfirmCitaError('');
    try {
      await api.confirmClientCita(confirmCitaTarget.id, confirmCitaMensaje.trim());
      if (confirmCitaTarget.__notificationId) {
        await api.markClientNotificationAsRead(confirmCitaTarget.__notificationId).catch(() => {});
      }
      setActionSuccess('Confirmaste tu asistencia. Se notificó a la clínica.');
      handleCloseConfirmCita();
      await loadPortalData();
    } catch (err) {
      setConfirmCitaError(err?.message || 'No se pudo confirmar la cita.');
    } finally {
      setConfirmCitaLoading(false);
    }
  };

  // Conecta los botones de la campana de notificaciones con los flujos de arriba
  const findCitaById = (citaId) => citas.find((c) => String(c.id) === String(citaId)) || { id: citaId };

  const handleNotificationConfirm = (notification) => {
    const citaId = Number(notification.reference_id || notification.reference);
    handleOpenConfirmCita({ ...findCitaById(citaId), __notificationId: notification.id });
  };

  const handleNotificationDecline = (notification) => {
    const citaId = Number(notification.reference_id || notification.reference);
    handleOpenCancel({ ...findCitaById(citaId), __notificationId: notification.id });
  };

  const handleNotificationDismiss = async (id) => {
    if (!id) return;
    try {
      await api.markClientNotificationAsRead(id);
    } catch (err) {
      console.error('Error al descartar la notificación:', err);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenRequestCita = () => {
    setReqMascotaId('');
    setReqMotivo('');
    setReqFecha('');
    setReqHora('');
    setRequestCitaError('');
    setShowRequestCita(true);
  };

  const handleCloseRequestCita = () => {
    setShowRequestCita(false);
  };

  const handleConfirmRequestCita = async () => {
    if (!reqMascotaId || !reqMotivo.trim()) {
      setRequestCitaError('Selecciona la mascota e indica el motivo.');
      return;
    }
    setRequestCitaLoading(true);
    setRequestCitaError('');
    try {
      await api.requestClientCita({
        mascotaId: reqMascotaId,
        motivo: reqMotivo.trim(),
        fechaPreferida: reqFecha || null,
        horaPreferida: reqHora || null
      });
      setActionSuccess('Tu solicitud de cita fue enviada a la clínica.');
      handleCloseRequestCita();
    } catch (err) {
      setRequestCitaError(err?.message || 'No se pudo enviar la solicitud.');
    } finally {
      setRequestCitaLoading(false);
    }
  };

  const handleOpenRenew = (receta) => {
    setRenewTarget(receta);
    setRenewNota('');
    setRenewError('');
  };

  const handleCloseRenew = () => {
    setRenewTarget(null);
    setRenewNota('');
    setRenewError('');
  };

  const handleConfirmRenew = async () => {
    if (!renewNota.trim()) {
      setRenewError('La nota es requerida.');
      return;
    }
    setRenewLoading(true);
    setRenewError('');
    try {
      await api.requestClientRecetaRenewal(renewTarget.id, renewNota.trim());
      setActionSuccess('Tu solicitud de renovación fue enviada al doctor.');
      handleCloseRenew();
    } catch (err) {
      setRenewError(err?.message || 'No se pudo enviar la solicitud.');
    } finally {
      setRenewLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    setLoading(true);
    setDataError('');
    try {
      await loadPortalData();
    } catch (err) {
      setDataError(err.message || TEXT_PORTAL.security.errorMessage);
      clientLogout();
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const columnsMascotas = [
    {
      header: 'Foto',
      render: (row) => (
        <PetAvatarCell
          pet={row}
          onUploaded={(id, url) => setMascotas(prev => prev.map(m => (m.id === id ? { ...m, imageUrl: url } : m)))}
        />
      )
    },
    { header: 'Nombre', render: (row) => <strong style={{ color: '#0f172a' }}>{row.nombre}</strong> },
    { header: 'Especie', accessor: 'especie' },
    { header: 'Raza', accessor: 'raza' },
    { header: 'Edad', render: (row) => row.edad || calculateAge(row.fechaNacimiento) }
  ];

  const columnsCitas = [
    { header: 'Mascota', render: (row) => <strong style={{ color: '#0f172a' }}>{row.mascota || row.mascota_nombre}</strong> },
    { header: 'Fecha', render: (row) => formatDate(row.fecha || row.fecha_cita) },
    { header: 'Hora', render: (row) => formatHour(row.hora || row.hora_cita) },
    { header: 'Motivo', accessor: 'motivo' },
    {
      header: 'Estado',
      render: (row) => (
        <Barnner type={(row.estado === 'Completada' || row.estado?.toLowerCase() === 'completada') ? 'success' : 'warning'}>
          {row.estado}
        </Barnner>
      )
    },
    {
      header: 'Acciones',
      render: (row) => (
        CANCELLABLE_STATES.includes(String(row.estado || '').toLowerCase()) ? (
          <Button
            variant={Button.VARIANTS.DANGER}
            color={Button.COLORS.TRANSPARENT}
            size={Button.SIZES.SMALL}
            onClick={() => handleOpenCancel(row)}
          >
            Cancelar
          </Button>
        ) : null
      )
    }
  ];

  const columnsRecetas = [
    { header: 'Fecha', render: (row) => formatDate(row.fecha || row.fecha_consulta || row.createdAt) },
    { header: 'Mascota', render: (row) => <strong style={{ color: '#0f172a' }}>{row.mascota || row.mascota_nombre}</strong> },
    { header: 'Doctor', render: (row) => row.doctor || row.doctor_nombre || '—' },
    { header: 'Prescripción', render: (row) => row.prescripcion || row.receta || '—' },
    {
      header: 'Acciones',
      render: (row) => (
        <div className={styles.recetaActions}>
          {row.urlDocx && (
            <a
              href={row.urlDocx}
              target="_blank"
              rel="noreferrer"
              className={styles.recetaPdfLink}
              title="Descargar PDF"
            >
              <FileText size={16} />
            </a>
          )}
          <Button
            variant={Button.VARIANTS.GHOST}
            size={Button.SIZES.SMALL}
            onClick={() => handleOpenRenew(row)}
          >
            Solicitar renovación
          </Button>
        </div>
      )
    }
  ];

  if (initialLoading) {
    return (
      <div className={styles.fullPageLoader}>
        <Loading size="giant" text="Cargando Portal del Cliente..." />
      </div>
    );
  }

  if (session) {
    return (
      <>
      <input
        type="file"
        ref={clientAvatarInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleClientAvatarSelect}
      />
      <ClientPanel
        menuTitle="Portal Clientes"
        title={`Bienvenido, ${session.nombre} ${session.apellido || ''}`.trim()}
        message="Consulta el estado de tus mascotas, citas y recetas."
        menuItems={clientMenuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        notifications={notifications}
        onNotificationConfirm={handleNotificationConfirm}
        onNotificationDecline={handleNotificationDecline}
        onNotificationDismiss={handleNotificationDismiss}
        userName={session.nombre}
        userAvatarUrl={clientAvatarPreview || session.image_url}
        onChangeAvatarClick={uploadingAvatar ? undefined : openClientAvatarPicker}
      >
        <div className={styles.resultsSection}>
          {actionSuccess && (
            <div style={{ marginBottom: '1rem' }}>
              <Barnner type="success">{actionSuccess}</Barnner>
            </div>
          )}
          {activeTab === 'pets' && (
            <div>
              <h2 className={styles.sectionTitle}>
                <PawPrint size={24} color="#0ea5e9" />
                {TEXT_PORTAL.tabs.pets}
              </h2>
              <TableA
                columns={columnsMascotas}
                data={mascotas}
                keyExtractor={(row) => row.id}
              />
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}>
                  <Calendar size={24} color="#f59e0b" />
                  {TEXT_PORTAL.tabs.appointments}
                </h2>
                <Button variant={Button.VARIANTS.PRIMARY} onClick={handleOpenRequestCita}>
                  Solicitar cita nueva
                </Button>
              </div>
              <TableA
                columns={columnsCitas}
                data={citas}
                keyExtractor={(row) => row.id}
              />
            </div>
          )}

          {activeTab === 'recipes' && (
            <div>
              <h2 className={styles.sectionTitle}>
                <FileText size={24} color="#10b981" />
                {TEXT_PORTAL.tabs.recipes}
              </h2>
              <TableA
                columns={columnsRecetas}
                data={recetas}
                keyExtractor={(row) => row.id}
              />
            </div>
          )}
        </div>

        <DrawPanel
          isOpen={!!cancelTarget}
          onClose={handleCloseCancel}
          title="Cancelar cita"
          description={cancelTarget ? `${cancelTarget.mascota || cancelTarget.mascota_nombre} — ${formatDate(cancelTarget.fecha || cancelTarget.fecha_cita)}` : ''}
          showActions
          onConfirm={handleConfirmCancel}
          confirmText={cancelLoading ? 'Cancelando...' : 'Confirmar cancelación'}
          cancelText="Volver"
          loading={cancelLoading}
        >
          <div className={styles.requestFormStack}>
            <MultilinePlaceholder
              label="Motivo de la cancelación"
              placeholder="Ej: no podré asistir ese día"
              value={cancelMotivo}
              onChange={(e) => setCancelMotivo(e.target.value)}
              error={cancelError}
              required
            />
          </div>
        </DrawPanel>

        <DrawPanel
          isOpen={!!confirmCitaTarget}
          onClose={handleCloseConfirmCita}
          title="Confirmar asistencia"
          description={confirmCitaTarget ? `${confirmCitaTarget.mascota || confirmCitaTarget.mascota_nombre || ''} — ${formatDate(confirmCitaTarget.fecha || confirmCitaTarget.fecha_cita)}`.trim() : ''}
          showActions
          onConfirm={handleConfirmConfirmCita}
          confirmText={confirmCitaLoading ? 'Enviando...' : 'Confirmar asistencia'}
          cancelText="Volver"
          loading={confirmCitaLoading}
        >
          <div className={styles.requestFormStack}>
            <MultilinePlaceholder
              label="Mensaje para la clínica (opcional)"
              placeholder="Ej: allí estaré, gracias"
              value={confirmCitaMensaje}
              onChange={(e) => setConfirmCitaMensaje(e.target.value)}
              error={confirmCitaError}
            />
          </div>
        </DrawPanel>

        <DrawPanel
          isOpen={showRequestCita}
          onClose={handleCloseRequestCita}
          title="Solicitar nueva cita"
          description="Indica los datos y la Secretaria confirmará la fecha y el doctor contigo."
          showActions
          onConfirm={handleConfirmRequestCita}
          confirmText={requestCitaLoading ? 'Enviando...' : 'Enviar solicitud'}
          cancelText="Cancelar"
          loading={requestCitaLoading}
        >
          <div className={styles.requestFormStack}>
            <Selector
              label="Mascota"
              value={reqMascotaId}
              onChange={(e) => setReqMascotaId(e.target.value)}
              options={mascotas.map((m) => ({ value: m.id, label: m.nombre }))}
              placeholder="Selecciona tu mascota"
              required
            />
            <Input
              label="Motivo"
              placeholder="Ej: control de rutina, vacuna, etc."
              value={reqMotivo}
              onChange={(e) => setReqMotivo(e.target.value)}
              required
            />
            <CalendarPicker
              label="Fecha preferida (opcional)"
              name="fecha_preferida"
              value={reqFecha}
              onChange={(e) => setReqFecha(e.target.value)}
            />
            <HoursPicker
              label="Hora preferida (opcional)"
              name="hora_preferida"
              value={reqHora}
              onChange={(e) => setReqHora(e.target.value)}
            />
            {requestCitaError && <Barnner type="danger">{requestCitaError}</Barnner>}
          </div>
        </DrawPanel>

        <DrawPanel
          isOpen={!!renewTarget}
          onClose={handleCloseRenew}
          title="Solicitar renovación de receta"
          description={renewTarget ? `Receta original de ${renewTarget.mascota || renewTarget.mascota_nombre}: "${renewTarget.prescripcion || renewTarget.receta}"` : ''}
          showActions
          onConfirm={handleConfirmRenew}
          confirmText={renewLoading ? 'Enviando...' : 'Enviar solicitud'}
          cancelText="Volver"
          loading={renewLoading}
        >
          <div className={styles.requestFormStack}>
            <Input
              label="Nota para el doctor"
              placeholder="Ej: se me acabó el tratamiento, sigue igual"
              value={renewNota}
              onChange={(e) => setRenewNota(e.target.value)}
              error={renewError}
              required
            />
          </div>
        </DrawPanel>

        {/* <AsistentChat /> */}
      </ClientPanel>
      </>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Container className={styles.portalContainer} showPagination={false}>
        <div className={styles.topBar}>
          <Button
            variant="ghost"
            color={Button.COLORS.BLUE}
            icon={BookUser}
            onClick={() => setShowContacts(true)}
          >
            {TEXT_PORTAL.contacts.buttonLabel}
          </Button>
        </div>

        {isDummyModeActive() && (
          <div className={styles.mockBanner}>
            Modo Maqueta: El portal de clientes usa datos reales de autenticación aunque el resto de la app esté en modo maqueta.
          </div>
        )}

        <div className={styles.header}>
          <img src="/HappyPetsLogo.png" alt="Happy Pets Logo" className={styles.logo} />
          <h1 className={styles.title}>{TEXT_PORTAL.title}</h1>
          <p className={styles.subtitle}>{TEXT_PORTAL.subtitle}</p>
        </div>

        {dataError && (
          <div style={{ maxWidth: '700px', margin: '0 auto 1.5rem auto' }}>
            <Barnner type="danger">{dataError}</Barnner>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
            <Loading size="medium" phrases={['Cargando información...']} />
          </div>
        ) : (
          <ClientLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </Container>

      <ContactsPanel
        isOpen={showContacts}
        onClose={() => setShowContacts(false)}
      />

      {/* <AsistentChat /> */}
    </div>
  );
}
