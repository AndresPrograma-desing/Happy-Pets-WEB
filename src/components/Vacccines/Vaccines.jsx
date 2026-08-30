import React from 'react';
import { useLocation } from 'react-router-dom';
import VaccineList from './Components/Vacunas/VaccineList';
import VaccineCreate from './Components/Vacunas/Created/VaccineCreate';
import PendingVaccinations from './Components/Pendientes/Index';
import VaccineBatchesPanel from './Components/Lotes/Index';

export default function Vaccines() {
  const location = useLocation();
  const view = location.state?.view || 'list';

  if (view === 'manage') {
    return <VaccineCreate openCreate={location.state?.openCreate} />;
  }

  if (view === 'pending') {
    return <PendingVaccinations />;
  }

  if (view === 'batches') {
    return <VaccineBatchesPanel />;
  }

  return <VaccineList />;
}
