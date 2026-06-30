import React from 'react';
import { createPortal } from 'react-dom';
import styles from '../AlertModal/AlertModal.module.css';
import { UserCircle } from 'lucide-react';

export default function SelectModal({ open, onClose, onSelectMascota, clients = [], query = '', setQuery, loading }) {
    if (!open) return null;

    const content = (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>Seleccionar Cliente y Mascota</h3>
                <div className={styles.modalBody}>
                    <input
                        type="text"
                        placeholder="Buscar por dueño o mascota (mín. 2 letras)..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                        autoFocus
                    />
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {loading && (
                            <div style={{ color: '#888', textAlign: 'center', margin: 16 }}>Buscando en servidor...</div>
                        )}
                        {!loading && clients.length === 0 && (
                            <div style={{ color: '#888', textAlign: 'center', margin: 16 }}>No se encontraron registros.</div>
                        )}
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {clients.map(cliente => (
                                <li key={cliente.id} style={{ marginBottom: 14, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                                        <UserCircle size={24} color="#32c00b" style={{ marginRight: 8 }} />
                                        <div>
                                            <b style={{ fontSize: 15 }}>{cliente.fullName}</b>
                                            <div style={{ color: '#666', fontSize: 12 }}>C.I: {cliente.identificacion || 'N/A'} | {cliente.email}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Sub-lista de mascotas del cliente */}
                                    <div style={{ paddingLeft: 32, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {cliente.mascotas.length === 0 ? (
                                            <span style={{ color: '#999', fontSize: 12, italic: 'true' }}>Sin mascotas registradas</span>
                                        ) : (
                                            cliente.mascotas.map(mascota => (
                                                <button
                                                    key={mascota.id}
                                                    type="button"
                                                    className={styles.modalPrimary}
                                                    style={{ 
                                                        padding: '3px 10px', 
                                                        fontSize: 12, 
                                                        background: '#f3f4f6', 
                                                        color: '#1f2937', 
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: 4,
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => onSelectMascota(cliente, mascota)}
                                                >
                                                    🐾 {mascota.nombre}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className={styles.modalActions} style={{ marginTop: 12 }}>
                    <button type="button" className={styles.modalSecondary} onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}