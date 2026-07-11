import React, { useState } from 'react';
import DrawPanel from '../screens/components/DrawPanel';
import Search from '../screens/components/Material-UI/Components/Search/Index';
import ToggleCard from '../screens/components/ToggleCard';

export default function SelectModal({ open, onClose, onSelectMascota, clients = [], query = '', setQuery, loading }) {
    const [autocompleteOpen, setAutocompleteOpen] = useState(false);

    // Flatten clients and pets into label-value pairs for MUI Autocomplete
    const options = clients.flatMap(cliente => 
        (cliente.mascotas || []).map(mascota => ({
            value: `${cliente.id}-${mascota.id}`,
            label: `${cliente.fullName} - ${mascota.nombre} (🐾)`,
            cliente,
            mascota
        }))
    );

    return (
        <DrawPanel
            isOpen={open}
            onClose={onClose}
            title="Seleccionar Cliente y Mascota"
            width="450px"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                <Search
                    open={autocompleteOpen}
                    onOpen={() => setAutocompleteOpen(true)}
                    onClose={() => setAutocompleteOpen(false)}
                    options={options}
                    loading={loading}
                    inputValue={query}
                    onInputChange={(val) => setQuery(val || '')}
                    onChange={(selected) => {
                        if (selected) {
                            onSelectMascota(selected.cliente, selected.mascota);
                        }
                    }}
                    label="Buscar Cliente / Mascota"
                    placeholder="Escribe el nombre del dueño o la mascota..."
                />
                
                <ToggleCard 
                    title="Buscar Cliente / Mascota"
                    description="Escribe el nombre del dueño o la mascota..."
                    activeColor="#088d4f"   
                    inactiveColor="#919191"
                    thumbColor="#ffffff"
                />
            </div>
        </DrawPanel>
    );
}