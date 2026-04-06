import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import './health.css';

function Health() {
  const [status, setStatus] = useState({ loading: true, ok: false, info: null });

  const isMounted = useRef(false);

  async function check() {
    if (!isMounted.current) return;
    if (isMounted.current) setStatus({ loading: true, ok: false, info: null });
    try {
      // Intentamos llamar a un endpoint de health conocido; si no existe, request fallará y mostraremos el error
      const data = await api.request('/users', { method: 'GET', auth: false });
      if (isMounted.current) setStatus({ loading: false, ok: true, info: data ?? 'OK' });
    } catch (err) {
        console.error('Error al comprobar /users:', err);
      // Si /users no existe, intentamos la raíz de la API (por si el backend expone algo allí)
      try {
        const data2 = await api.request('/', { method: 'GET', auth: false });
        if (isMounted.current) setStatus({ loading: false, ok: true, info: data2 ?? 'OK (root)'});
      } catch (err2) {
        if (isMounted.current) setStatus({ loading: false, ok: false, info: err2.message || String(err2) });
      }
    }
  }

  useEffect(() => {
    isMounted.current = true;
    // Ejecutar la comprobación de forma asíncrona para evitar setState sincrónico dentro del efecto
    Promise.resolve().then(() => { if (isMounted.current) check(); });
    return () => { isMounted.current = false; };
  }, []);

  return (
    <div className="health-root">
      <h1>Comprobación API</h1>
      {status.loading ? (
        <p>Comprobando conexión con el API...</p>
      ) : (
        <div className={status.ok ? 'ok' : 'error'}>
          <p><strong>{status.ok ? 'Conectado' : 'Error al conectar'}</strong></p>
          <pre className="info">{typeof status.info === 'string' ? status.info : JSON.stringify(status.info, null, 2)}</pre>
        </div>
      )}
      <div className="actions">
        <button onClick={check}>Reintentar</button>
      </div>
    </div>
  );
}

export default Health;
