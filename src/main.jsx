import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

//css
import './styles/variables.css';
import './styles/global.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Ocultar y eliminar el loader inicial una vez que React haya renderizado
const _hideInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (!loader) return;
  // esperar al siguiente frame para asegurar que se pinte la app
  requestAnimationFrame(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
    }, 300);
  });
};

_hideInitialLoader();
