import { useState, useMemo, useRef } from "react";

export function useSearchCitas(citas) {
    const [searchMode, setSearchMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef(null);

    const filtredCitas = useMemo(() => {
        if (!searchTerm.trim()) return citas || [];
        const q = String(searchTerm).trim().toLowerCase();
        return (citas || []).filter((c) => {
            const text = `$c?.paciente_nombre ${c?.paciente?.nombre} ${c?.patient?.name} ${c?.paciente_nombre} ${c?.paciente} ${c?.nombre} ${c?.name} ${c?.telefono} ${c?.rol} ${c?.id}`.toLowerCase();
            return text.includes(q);
        });
    }, [citas, searchTerm]);

    const toggleSearchMode = () => {
        setSearchMode((prev) => {
            const next = !prev;
            if(!next) setSearchTerm("");
            setTimeout(() => {
                try{
                  if(searchInputRef.current) searchInputRef.current.focus();
                }catch(err){
                    console.error('erro al enfocar el input de búsqueda:', err);
                }
            }, 100);
            return next;
        });
    };

    return {
        searchMode,
        toggleSearchMode,
        searchTerm,
        setSearchTerm,
        searchInputRef,
        filtredCitas,
    };
}