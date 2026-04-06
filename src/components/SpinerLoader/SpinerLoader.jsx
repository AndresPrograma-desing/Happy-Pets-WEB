import React from 'react';
import './SpinerLoader.module.css'; // Asegúrate de crear este archivo CSS


const SpinerLoader = () => {
  // Estilos en objetos para asegurar que se apliquen sí o sí
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)'
  };

  const spinnerContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  };

  return (
    <div style={overlayStyle}>
      <div style={spinnerContainerStyle}>
        {/* Insertamos el CSS de la animación directamente en un tag <style> */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .animate-spin-custom {
              animation: spin 0.8s linear infinite !important;
              transform-origin: center center !important;
              display: block;
            }
          `}
        </style>

        <svg 
          className="animate-spin-custom"
          width="100" 
          height="100" 
          viewBox="0 0 50 50"
          style={{ overflow: 'visible' }}
        >
          {/* Círculo de fondo (Gris tenue) */}
          <circle 
            cx="25" cy="25" r="20" 
            fill="none" 
            stroke="#334155" 
            strokeWidth="5" 
          />
          {/* Arco que gira (Tu color turquesa) */}
          <circle 
            cx="25" cy="25" r="20" 
            fill="none" 
            stroke="#0ea5a4" 
            strokeWidth="5" 
            strokeLinecap="round"
            strokeDasharray="90, 150"
          />
        </svg>

        <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
          CARGANDO SISTEMA...
        </p>
      </div>
    </div>
  );
};

export default SpinerLoader;