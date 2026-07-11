import React from 'react';
import Search from '../../screens/components/Material-UI/Components/Search/Index';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = "Buscar...", label = "Buscar" }) {
  return (
    <Search
      freeSolo
      options={[]}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      label={label}
      slotProps={{
        input: {
          startAdornment: (
            <SearchIcon size={18} style={{ color: '#64748b', marginRight: '8px' }} />
          )
        }
      }}
    />
  );
}