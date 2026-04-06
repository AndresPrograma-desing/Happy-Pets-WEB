import React, { useState, useEffect, startTransition } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Inicio/Home';
import LoginForm from './components/auth/LoginForm';
import AdminSystem from './pages/AdminSystem/AdminSystem';
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
import SpinerLoader from './components/SpinerLoader/SpinerLoader'; 
import { useLocation } from 'react-router-dom';
import PanelMenssage from './pages/PanelMenssage/PanelMenssage';
import FacturaManager from "./components/FacturaDownloader/FacturaDownloader";
import FacturaLocal from "./components/FacturaLocalComponets/FacturaLocal";
// ... tus otros imports (Home, Login, etc.)

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation(); // Detecta cambios de URL y navegación atrás/adelante

  useEffect(() => {
    // Evitar setState síncrono dentro del efecto usando startTransition
    startTransition(() => setIsLoading(true));

    // Simulamos un tiempo de carga corto para que la animación se vea
    const timer = setTimeout(() => {
      startTransition(() => setIsLoading(false));
    }, 800);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {isLoading && <SpinerLoader />}
      
      {/* El contenido solo se muestra (o se anima) cuando deja de cargar */}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
     
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/AdminSystem" element={<AdminSystem />} />
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
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;