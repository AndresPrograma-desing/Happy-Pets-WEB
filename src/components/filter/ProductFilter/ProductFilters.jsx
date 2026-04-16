import React, { useState } from 'react';
import './ProductFilters.css';
import { getIcon } from '../../../assets/icons/ExportIcon/Index';

export default function ProductFilters({
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    maxPrice, setMaxPrice,
    categories = [],
    onClear,
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="filterBar">
                <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="newChatBtn" onClick={() => setOpen(true)}>
                        <img src={getIcon('filter')} alt="" className="filterIcon" aria-hidden="true" />
                        Filtros</button>
                    <button type="button" className="clearBtn" onClick={onClear} aria-label="Limpiar filtros">
                        <img src={getIcon('trash')} alt="" className="trashIcon" aria-hidden="true" />
                        <span>Limpiar</span>
                    </button>
                </div>
                <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '.9rem' }}>Buscar: {searchTerm || '—'}</div>
            </div>

            {open && (
                <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
                    <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0 }}>Opciones de filtro</h3>

                        <label className="filterLabel">Nombre</label>
                        <input className="filterInput" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                        <label className="filterLabel">Categoría</label>
                        <select className="filterSelect" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="">Todas las categorías</option>
                            {categories.map((cat) => {
                                const val = typeof cat === 'string' ? cat : (cat.id ?? String(cat));
                                const label = typeof cat === 'string' ? cat : (cat.name ?? val);
                                return <option key={val} value={val}>{label}</option>;
                            })}
                        </select>

                        <label className="filterLabel">Precio máximo</label>
                        <input className="filterInputPrice" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                            <button type="button" className="secondary" onClick={() => setOpen(false)}>Cancelar</button>
                            <button type="button" className="primary" onClick={() => setOpen(false)}>Aplicar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}