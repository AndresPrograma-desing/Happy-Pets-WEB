import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles } from '../redux/slices/rolesSlice';

export default function useRoles() {
  const dispatch = useDispatch();
  const { roles, loading, error, hasFetched } = useSelector((state) => state.roles);

  useEffect(() => {
    if (!hasFetched && !loading) {
      dispatch(fetchRoles());
    }
  }, [dispatch, hasFetched, loading]);

  const refetch = () => {
    dispatch(fetchRoles());
  };

  return { roles, loading, error, refetch };
}
