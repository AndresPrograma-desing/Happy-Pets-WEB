import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfile } from '../../services/api';

// Thunk to fetch the logged-in user's profile (GET /auth/me) asynchronously
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfile();
      return response?.data || response?.user || response || null;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener el perfil');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    loading: false,
    error: null,
    hasFetched: false,
  },
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.hasFetched = false;
    },
    updateUserProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.hasFetched = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ocurrió un error';
      });
  },
});

export const { clearUserProfile, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;
