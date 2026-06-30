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

function AppContent() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Obtener el user_id usando la utilidad
  const userId = getUserId();
  
  const isPublicRoute = ['/login', '/inicio', '/'].includes(location.pathname);

  useEffect(() => {
    startTransition(() => setIsLoading(false));
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
          <Route path="/login" element={<LoginForm />} />
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
          <Route path="/clients" element={<ClientList />} />
          <Route path="/calendar" element={<CalendarTest />} />
          
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      {/* </div> */}
    </>
  );
}



function App() {

      const { isOnline, isBackendAlive } = useHealthCheck();

  if (!isOnline) {
    return <WaitingPage></WaitingPage>;
  }

  if (!isBackendAlive) {
    return <WaitingPage> </WaitingPage>;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;