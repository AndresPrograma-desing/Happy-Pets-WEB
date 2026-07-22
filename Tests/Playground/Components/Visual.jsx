import React from 'react';
import Playground from '../Playground';
import ToggleCard from '../../../src/components/screens/components/ToggleCard';
import LikeButton from './like.jsx';

// 1. Definimos los escenarios/estados de prueba que queremos ver en el select
const ToggleCardDefault = () => <ToggleCard />;
const LikeButtonExample = () => <LikeButton />;
// Ejemplo de otras variantes si tuviera props (ej: <ToggleCard isActive={true} />)

// 2. Creamos el diccionario que leerá el Playground
const componentesEnTest = {
  "ToggleCard - Vista por Defecto": ToggleCardDefault,
  // Puedes agregar más componentes de prueba aquí abajo:
  // "ToggleCard - Estado Activo": ToggleCardActivo,
};

export default function VistaDesarrollo() {
  return (
    <Playground 
      registry={componentesEnTest} 
      showPagination={true} 
      paginationCount={5} 
    />
  );
}