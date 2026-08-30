import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpecies } from '../redux/slices/speciesSlice';

const capitalize = (text) => {
  const str = String(text || '');
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function useSpecies() {
  const dispatch = useDispatch();
  const { species, loading, error, hasFetched } = useSelector((state) => state.species);

  useEffect(() => {
    if (!hasFetched && !loading) {
      dispatch(fetchSpecies());
    }
  }, [dispatch, hasFetched, loading]);

  const refetch = () => {
    dispatch(fetchSpecies());
  };

  // Listas/Selectores esperan { value, label }; el backend devuelve { id, nombre }.
  const speciesOptions = useMemo(
    () => species.map((item) => ({
      value: item.nombre,
      label: capitalize(item.nombre),
    })),
    [species]
  );

  return { species, speciesOptions, loading, error, refetch };
}
