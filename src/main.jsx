import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './redux/store';

import './styles/variables.css';
import './styles/global.css';
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);

const _hideInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (!loader) return;
  requestAnimationFrame(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
    }, 300);
  });
};

_hideInitialLoader();
