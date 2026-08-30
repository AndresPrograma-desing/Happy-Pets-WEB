import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from '../redux/slices/userSlice';

export default function useUserProfile() {
  const dispatch = useDispatch();
  const { profile, loading, error, hasFetched } = useSelector((state) => state.user);

  useEffect(() => {
    if (!hasFetched && !loading) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, hasFetched, loading]);

  const refetch = () => dispatch(fetchUserProfile());

  const fullName = profile?.name || profile?.nombre || null;
  const firstName = fullName ? String(fullName).trim().split(/\s+/)[0] : null;
  const avatarUrl = profile?.avatarUrl || profile?.avatar_url || profile?.avatar || null;
  const permissions = profile?.permissions ?? null;

  return { profile, firstName, avatarUrl, permissions, loading, error, hasFetched, refetch };
}
