import React, { useState, useEffect, startTransition } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

//Manejo de fallas de conexion al servidor o internet
import useHealthCheck from './hooks/useHealthCheck';
import WaitingPage from './components/Waiting/witing';
//---------------------------------------------------------
//Páginas
import Home from './pages/Inicio/Home';
import LoginForm from './components/auth/LoginForm';
import AdminSystem from './pages/AdminSystem/AdminSystem';
import DashboardPage from './pages/AdminSystem/Dashboard';
import SecretariaSystem from './pages/SecretariSystem/SecretariaSystem';
import DoctorSystem from './pages/DoctorSystem/DoctorSystem';
import Health from './pages/Health/Health';
import Products from './pages/AdminSystem/products/Products';
import ProductCreate from './pages/AdminSystem/products/Created/ProductCreate';
import CitasDoctor from './components/CitasAdmin/CitasDoctor';
import CreatedCita from './pages/DoctorSystem/CreatedCita/CreatedCita';
import Consultas from './pages/DoctorSystem/Consultas/Consultas';
import CustomerAndPets from './pages/DoctorSystem/CreateCustomerAndPets/CustomerAndPets';
import CreateFactura from './pages/Facturas/CreateFactura';
import { useLocation } from 'react-router-dom';
import PanelMenssage from './pages/PanelMenssage/PanelMenssage';
import FacturaManager from "./components/FacturaDownloader/FacturaDownloader";
import FacturaLocal from "./components/FacturaLocalComponets/FacturaLocal";
import InDevelopment from "./components/InDevelopment/InDevelopment";
import FacturasList from './components/FacturaDownloader/FacturaList/facturas';
import Settings from './pages/AdminSystem/ConfigurationPanel/settings';
import Users from "./components/Users/users";
import StatusModal from "./components/common/statusWarning";
import { getUserId } from "./context/LocalStorage";
import CalendarTest from "./components/test/CalendarTest/CalendarCitas";
import ClientList from './components/Clients/ClientList/list';
import GlobalPushNotification from './components/Notification/Push';
import EmailsTemplates from './components/Emails/Templates';
import Recetas from './components/Recetas/Components';

function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Obtener el user_id usando la utilidad
  const userId = getUserId();
  
  const isPublicRoute = ['/login', '/inicio', '/', '/witing'].includes(location.pathname);

  useEffect(() => {
    startTransition(() => setIsLoading(true));
    const timer = setTimeout(() => {
      startTransition(() => setIsLoading(false));
    }, 800);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {/* <InDevelopment />
      <StatusModal userId={userId} />
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}> */}
        {!isPublicRoute && userId && <GlobalPushNotification userId={userId} />}
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/login" element={<Navigate to="/inicio" replace />} />
          <Route path="/AdminSystem" element={<AdminSystem />} />
          <Route path="/AdminSystem/dashboard" element={<DashboardPage />} />
          <Route path="/SecretariaSystem" element={<SecretariaSystem />} />
          <Route path="/doctor" element={<DoctorSystem />} />
          <Route path="/citas" element={<CitasDoctor />} />
          <Route path="/panel-menssage" element={<PanelMenssage />} />
          <Route path="/citas/crear" element={<CreatedCita />} />
          <Route path="/consultas/crear" element={<Consultas />} />
          <Route path="/facturas/crear" element={<CreateFactura />} />
          <Route path="/clientes/crear" element={<CustomerAndPets />} />
          <Route path="/AdminSystem/products" element={<Products />} />
          <Route path="/AdminSystem/products/manage" element={<ProductCreate />} />
          <Route path="/factura-manager" element={<FacturaManager />} />
          <Route path="/factura-local" element={<FacturaLocal />} />
          <Route path="/facturas" element={<FacturasList />} />
          <Route path="/AdminSystem/settings" element={<Settings />} />
          <Route path="/AdminSystem/users" element={<Users />} />
          <Route path="/AdminSystem/emails" element={<EmailsTemplates />} />
          <Route path="/doctor/recetas" element={<Recetas />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/calendar" element={<CalendarTest />} />
          
          <Route path="/health" element={<Health />} />
          <Route path="/witing" element={<WaitingPage />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      {/* </div> */}
    </>
  );
}



import { Wifi, XCircle } from 'lucide-react';
import ToggleCard from './components/screens/components/ToggleCard/index.jsx';
import Button from './components/screens/components/Button/index.jsx';

function App() {
  const { isOnline, isBackendAlive, actualBackendAlive, isDummy, isChecking } = useHealthCheck();

  return (
    <>
      {isDummy && actualBackendAlive && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          width: '90%',
          maxWidth: '500px',
          animation: 'fadeInDown 0.5s ease-out'
        }}>
          <style>{`
            @keyframes fadeInDown {
              from { opacity: 0; transform: translate(-50%, -20px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
          <div style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', borderRadius: '12px', background: 'white' }}>
            <ToggleCard
              title="¡Servidor en línea de nuevo!"
              description="Se ha detectado conexión con el backend real."
              icon={Wifi}
              action={
                <Button 
                  variant="primary" 
                  color="green" 
                  size="small"
                  onClick={() => {
                    localStorage.removeItem('USE_DUMMY_DATA');
                    window.location.href = '/login';
                  }}
                >
                  Conectar
                </Button>
              }
            />
          </div>
        </div>
      )}
      
      <Router>
        <AppRouterWrapper isOnline={isOnline} isBackendAlive={isBackendAlive} isChecking={isChecking} />
      </Router>
    </>
  );
}

function AppRouterWrapper({ isOnline, isBackendAlive, isChecking }) {
  const location = useLocation();

  // While the first health-check is still running, render nothing.
  // This prevents a premature redirect on every page reload.
  if (isChecking) {
    return null;
  }

  if (!isOnline || !isBackendAlive) {
    if (location.pathname !== '/witing') {
      // Remember where the user was so we can restore it after reconnection
      sessionStorage.setItem('redirectAfterWiting', location.pathname);
      return <Navigate to="/witing" replace />;
    }
  } else if (location.pathname === '/witing') {
    // Restore the original path, or default to /inicio
    const returnTo = sessionStorage.getItem('redirectAfterWiting') || '/inicio';
    sessionStorage.removeItem('redirectAfterWiting');
    return <Navigate to={returnTo} replace />;
  }

  return <AppContent />;
}

export default App;