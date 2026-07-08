import React from 'react';
import './ProductFilters.css';
import Filter from '../../screens/components/Filter/Index';

export default function ProductFilters({
    searchTerm, setSearchTerm,
    filterCategory, setFilterCategory,
    maxPrice, setMaxPrice,
    categories = [],
    onClear,
}) {
    // Filter component already manages open/close state and render the Apply/Cancel buttons
    // The "Aplicar" button in Filter will just close the panel, as data is bound to state variables

    return (
        <Filter
            searchTerm={searchTerm}
            onClear={onClear}
            title="Opciones de filtros"
        >
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
        </Filter>
    );
}